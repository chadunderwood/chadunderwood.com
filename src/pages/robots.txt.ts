import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const site = context.site?.toString().replace(/\/$/, '') || '';
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /secret',
    '',
  ];
  // Only emit absolute Sitemap when SITE_URL is set (staging/prod). Avoid baking chadunderwood.com early.
  if (site) {
    lines.push(`Sitemap: ${site}/sitemap-index.xml`, '');
  }
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
