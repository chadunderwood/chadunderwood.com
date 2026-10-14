# Production cutover checklist — chadunderwood.com

Run before/after any staging → production promotion. Nothing here contains secrets.

## Indexing
- [ ] Production `blog_public` = 1 (`wp option get blog_public` → `1`; Settings › Reading "Discourage search engines" unchecked).
- [ ] Apex HTML has `<meta name='robots' content='max-image-preview:large' />` and **no** `noindex`; no `X-Robots-Tag` header (`curl -sI https://chadunderwood.com/`).
- [ ] Staging still sends `X-Robots-Tag: noindex, nofollow`, robots meta noindex, and `/wp-sitemap.xml` is 404 (theme guard: `chad_personal_is_staging()` in `inc/findability.php`).
- [ ] `https://chadunderwood.com/robots.txt` contains `Sitemap: https://chadunderwood.com/wp-sitemap.xml`.

## Search Console
- [ ] Domain property `chadunderwood.com` verified (DNS TXT at Cloudflare/registrar).
- [ ] Sitemap `https://chadunderwood.com/wp-sitemap.xml` submitted; status "Success"; essays discovered.
- [ ] Spot-check URL Inspection on `/`, `/essays/`, one essay.

## Feeds & identity
- [ ] `/feed/` is 200 RSS; `/essays/feed/` 301 → `/feed/`; each page has one `rel="alternate" application/rss+xml` link.
- [ ] `rel="me"` links present for X, GitHub, PPR Pros.

## Analytics
- [ ] One privacy-light tool (Cloudflare Web Analytics or Plausible) loads on the apex only; staging view-source shows no beacon.
- [ ] Site token stored in wp-config/options (not in repo).
- [ ] Pageviews visible in the dashboard within 24 h.

## After deploy
- [ ] `wp rewrite flush` on the target install.
- [ ] Purge Cloudflare cache if HTML is cached at the edge.
