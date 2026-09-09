import { corsHeaders, json, type Env, type WritingPost } from '../_lib/auth';

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const headers = corsHeaders(context.request);
  try {
    const list = await context.env.WRITING_POSTS.list();
    const posts: WritingPost[] = [];
    for (const key of list.keys) {
      const raw = await context.env.WRITING_POSTS.get(key.name);
      if (!raw) continue;
      try {
        const post = JSON.parse(raw) as WritingPost;
        if (post && post.status !== 'draft') {
          posts.push({
            title: post.title,
            slug: post.slug || key.name,
            body: post.body,
            status: post.status || 'published',
            date: post.date,
            updated: post.updated,
            edition: post.edition,
            tags: post.tags,
            summary: post.summary,
          });
        }
      } catch {
        /* skip bad */
      }
    }
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    const lean = posts.map(({ body, ...rest }) => ({
      ...rest,
      summary: rest.summary || String(body || '').replace(/[#>*_`]/g, '').slice(0, 160),
    }));
    return json(lean, 200, { ...headers, 'Cache-Control': 'public, max-age: 30' });
  } catch {
    return json({ ok: false, error: 'Failed to load writing' }, 500, headers);
  }
};
