import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedWriting } from '../lib/writing';
import site from '../content/site.json';

export async function GET(context: APIContext) {
  const posts = await getPublishedWriting();
  // Absolute feed links need a site base. Prefer SITE_URL; local/unset uses localhost so we don't emit chadunderwood.com early.
  const siteBase = context.site ?? new URL('http://localhost:4321');
  return rss({
    title: `${site.name} — Writing`,
    description: site.description,
    site: siteBase,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary || '',
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
