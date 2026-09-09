import { corsHeaders, json, type Env, type WritingPost } from '../../_lib/auth';

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const headers = corsHeaders(context.request);
  const slug = context.params.slug as string;
  if (!slug) return json({ ok: false, error: 'Missing slug' }, 400, headers);
  try {
    const raw = await context.env.WRITING_POSTS.get(slug);
    if (!raw) return json({ ok: false, error: 'Not found' }, 404, headers);
    const post = JSON.parse(raw) as WritingPost;
    if (post.status === 'draft') return json({ ok: false, error: 'Not found' }, 404, headers);
    return json(post, 200, { ...headers, 'Cache-Control': 'public, max-age=30' });
  } catch {
    return json({ ok: false, error: 'Failed to load post' }, 500, headers);
  }
};
