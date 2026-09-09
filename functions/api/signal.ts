import { corsHeaders, json, type Env, type SignalPost, SIGNAL_KEY } from '../_lib/auth';

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const headers = corsHeaders(context.request);
  try {
    const raw = await context.env.SIGNAL_POSTS.get(SIGNAL_KEY);
    const posts: SignalPost[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(posts)) {
      return json([], 200, headers);
    }
    const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
    return json(sorted, 200, { ...headers, 'Cache-Control': 'public, max-age=30' });
  } catch (e) {
    return json({ ok: false, error: 'Failed to load signal posts' }, 500, headers);
  }
};
