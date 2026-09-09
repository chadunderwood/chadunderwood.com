export interface Env {
  SIGNAL_POSTS: KVNamespace;
  WRITING_POSTS: KVNamespace;
  PUBLISH_SECRET: string;
}

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allow =
    !origin ||
    origin === 'https://chadunderwood.com' ||
    origin === 'https://www.chadunderwood.com' ||
    origin.endsWith('.pages.dev') ||
    origin.startsWith('http://localhost');
  return allow
    ? {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    : {};
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function secretsEqual(expected: string, provided: string): boolean {
  if (!provided || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

/** Accept Authorization: Bearer <secret> and/or JSON body.secret (both trimmed). */
export function checkSecret(env: Env, request: Request, body: Record<string, unknown>): boolean {
  const expected = String(env.PUBLISH_SECRET || '').trim();
  if (!expected) return false;

  const candidates: string[] = [];
  const auth = request.headers.get('Authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    candidates.push(auth.slice(7).trim());
  }
  if (typeof body.secret === 'string') {
    candidates.push(body.secret.trim());
  }

  for (const provided of candidates) {
    if (secretsEqual(expected, provided)) return true;
  }
  return false;
}

export const UNAUTH_HINT =
  'Send Authorization: Bearer <PUBLISH_SECRET> and/or JSON body.secret — same value as Cloudflare Pages secret PUBLISH_SECRET.';

export function slugify(text: string, max = 80): string {
  return (
    String(text || 'untitled')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, max) || 'untitled'
  );
}

export type SignalPost = { id: string; date: string; body: string };
export type WritingPost = {
  title: string;
  slug: string;
  body: string;
  status: string;
  date: string;
  updated?: string;
  edition?: number;
  tags?: string[];
  summary?: string;
};

export const SIGNAL_KEY = 'posts';

/** Signal post id: YYYYMMDDHHMMSS in UTC from an ISO date (or now). */
export function signalTimestampId(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) {
    return signalTimestampId();
  }
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    String(d.getUTCFullYear()) +
    p(d.getUTCMonth() + 1) +
    p(d.getUTCDate()) +
    p(d.getUTCHours()) +
    p(d.getUTCMinutes()) +
    p(d.getUTCSeconds())
  );
}

export const SIGNAL_ID_RE = /^\d{14}$/;
