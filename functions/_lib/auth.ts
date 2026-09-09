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

export function checkSecret(env: Env, request: Request, body: Record<string, unknown>): boolean {
  const expected = String(env.PUBLISH_SECRET || '');
  if (!expected) return false;
  const auth = request.headers.get('Authorization') || '';
  let provided = '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    provided = auth.slice(7).trim();
  } else if (typeof body.secret === 'string') {
    provided = body.secret;
  }
  if (!provided || provided.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

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
