import {
  checkSecret,
  corsHeaders,
  json,
  readJson,
  slugify,
  UNAUTH_HINT,
  type Env,
  type SignalPost,
  type WritingPost,
  SIGNAL_KEY,
} from '../_lib/auth';

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = corsHeaders(context.request);
  const body = await readJson(context.request);

  const expectedConfigured = Boolean(String(context.env.PUBLISH_SECRET || '').trim());
  if (!expectedConfigured) {
    return json(
      { ok: false, error: 'server_misconfigured', hint: 'Pages secret PUBLISH_SECRET is not set on this deployment.' },
      503,
      headers,
    );
  }
  if (!checkSecret(context.env, context.request, body)) {
    return json({ ok: false, error: 'unauthorized', hint: UNAUTH_HINT }, 401, headers);
  }

  const type = String(body.type || '');
  const action = String(body.action || 'create');

  if (type !== 'writing' && type !== 'signal') {
    return json({ ok: false, error: 'type must be writing|signal' }, 400, headers);
  }
  if (!['create', 'update', 'delete'].includes(action)) {
    return json({ ok: false, error: 'action must be create|update|delete' }, 400, headers);
  }

  try {
    if (type === 'signal') {
      return await handleSignal(context.env, action, body, headers);
    }
    return await handleWriting(context.env, action, body, headers);
  } catch (e) {
    return json(
      { ok: false, error: e instanceof Error ? e.message : 'Server error' },
      500,
      headers,
    );
  }
};

async function handleSignal(
  env: Env,
  action: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
): Promise<Response> {
  const raw = await env.SIGNAL_POSTS.get(SIGNAL_KEY);
  let posts: SignalPost[] = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(posts)) posts = [];

  if (action === 'delete') {
    const id = String(body.id || '');
    if (!id) return json({ ok: false, error: 'id required for delete' }, 400, headers);
    const next = posts.filter((p) => p.id !== id);
    if (next.length === posts.length) {
      return json({ ok: false, error: 'Not found' }, 404, headers);
    }
    await env.SIGNAL_POSTS.put(SIGNAL_KEY, JSON.stringify(next));
    return json({ ok: true, id, url: 'https://chadunderwood.com/signal/' }, 200, headers);
  }

  const text = String(body.body || '').trim();
  if (!text) return json({ ok: false, error: 'body required' }, 400, headers);

  let id = String(body.id || '').trim();
  if (!id) id = slugify(text.slice(0, 40), 40);

  const now = new Date().toISOString();
  const existingIdx = posts.findIndex((p) => p.id === id);

  if (action === 'create' && existingIdx >= 0) {
    // upsert on create if same id
    posts[existingIdx] = { id, date: posts[existingIdx].date || now, body: text };
  } else if (action === 'update') {
    if (existingIdx < 0) return json({ ok: false, error: 'Not found' }, 404, headers);
    posts[existingIdx] = { id, date: posts[existingIdx].date || now, body: text };
  } else {
    posts.unshift({ id, date: now, body: text });
  }

  await env.SIGNAL_POSTS.put(SIGNAL_KEY, JSON.stringify(posts));
  return json(
    { ok: true, id, url: 'https://chadunderwood.com/signal/' },
    action === 'create' ? 201 : 200,
    headers,
  );
}

async function handleWriting(
  env: Env,
  action: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
): Promise<Response> {
  const title = String(body.title || '').trim();
  let slug = String(body.slug || '').trim();
  if (!slug && title) slug = slugify(title);
  if (!slug && body.id) slug = slugify(String(body.id));

  if (action === 'delete') {
    if (!slug) return json({ ok: false, error: 'slug (or id) required for delete' }, 400, headers);
    const existing = await env.WRITING_POSTS.get(slug);
    if (!existing) return json({ ok: false, error: 'Not found' }, 404, headers);
    await env.WRITING_POSTS.delete(slug);
    return json(
      { ok: true, slug, url: `https://chadunderwood.com/writing/${slug}/` },
      200,
      headers,
    );
  }

  if (!title && action === 'create') {
    return json({ ok: false, error: 'title required' }, 400, headers);
  }
  if (!slug) return json({ ok: false, error: 'slug required' }, 400, headers);

  const text = String(body.body || '');
  const status = String(body.status || 'published');
  const now = new Date().toISOString();
  const existingRaw = await env.WRITING_POSTS.get(slug);
  const existing: WritingPost | null = existingRaw ? JSON.parse(existingRaw) : null;

  if (action === 'update' && !existing) {
    return json({ ok: false, error: 'Not found' }, 404, headers);
  }

  const post: WritingPost = {
    title: title || existing?.title || slug,
    slug,
    body: text || existing?.body || '',
    status,
    date: existing?.date || (typeof body.date === 'string' ? body.date : now),
    updated: now,
    edition: typeof body.edition === 'number' ? body.edition : existing?.edition || 1,
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : existing?.tags || [],
    summary:
      typeof body.summary === 'string'
        ? body.summary
        : existing?.summary ||
          String(text || '')
            .replace(/[#>*_`]/g, '')
            .slice(0, 160),
  };

  if (action === 'update' && existing) {
    post.edition = (existing.edition || 1) + (body.updated === false ? 0 : 0);
    if (body.edition == null && body.updated !== false) {
      post.edition = (existing.edition || 1) + 1;
    }
  }

  await env.WRITING_POSTS.put(slug, JSON.stringify(post));
  return json(
    { ok: true, slug, url: `https://chadunderwood.com/writing/${slug}/` },
    action === 'create' ? 201 : 200,
    headers,
  );
}
