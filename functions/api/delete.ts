import {
  checkSecret,
  corsHeaders,
  json,
  readJson,
  UNAUTH_HINT,
  type Env,
  type SignalPost,
  SIGNAL_KEY,
} from '../_lib/auth';

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

/**
 * Safer delete — separate from /api/publish.
 * Requires:
 *   type: writing|signal
 *   slug (writing) or id (signal)
 *   confirm: must exactly equal that slug/id
 * Auth: same PUBLISH_SECRET (Bearer and/or body.secret)
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = corsHeaders(context.request);
  const body = await readJson(context.request);

  const expectedConfigured = Boolean(String(context.env.PUBLISH_SECRET || '').trim());
  if (!expectedConfigured) {
    return json(
      {
        ok: false,
        error: 'server_misconfigured',
        hint: 'Pages secret PUBLISH_SECRET is not set on this deployment.',
      },
      503,
      headers,
    );
  }
  if (!checkSecret(context.env, context.request, body)) {
    return json({ ok: false, error: 'unauthorized', hint: UNAUTH_HINT }, 401, headers);
  }

  const type = String(body.type || '').trim().toLowerCase();
  if (type !== 'writing' && type !== 'signal') {
    return json({ ok: false, error: 'type must be writing|signal' }, 400, headers);
  }

  const key =
    type === 'writing'
      ? String(body.slug || body.id || '').trim()
      : String(body.id || body.slug || '').trim();
  if (!key) {
    return json(
      { ok: false, error: type === 'writing' ? 'slug required' : 'id required' },
      400,
      headers,
    );
  }

  const confirm = String(body.confirm || '').trim();
  if (!confirm || confirm !== key) {
    return json(
      {
        ok: false,
        error: 'confirm_required',
        hint: 'Set JSON confirm to the exact slug/id being deleted (same string as slug or id).',
      },
      400,
      headers,
    );
  }

  try {
    if (type === 'signal') {
      const raw = await context.env.SIGNAL_POSTS.get(SIGNAL_KEY);
      let posts: SignalPost[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(posts)) posts = [];
      const next = posts.filter((p) => p.id !== key);
      if (next.length === posts.length) {
        return json({ ok: false, error: 'Not found' }, 404, headers);
      }
      await context.env.SIGNAL_POSTS.put(SIGNAL_KEY, JSON.stringify(next));
      return json({ ok: true, id: key, url: 'https://chadunderwood.com/signal/' }, 200, headers);
    }

    const existing = await context.env.WRITING_POSTS.get(key);
    if (!existing) return json({ ok: false, error: 'Not found' }, 404, headers);
    await context.env.WRITING_POSTS.delete(key);
    return json(
      { ok: true, slug: key, url: `https://chadunderwood.com/writing/${key}/` },
      200,
      headers,
    );
  } catch (e) {
    return json(
      { ok: false, error: e instanceof Error ? e.message : 'Server error' },
      500,
      headers,
    );
  }
};
