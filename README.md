# Chad Underwood — Personal site

Dark, ped.ro-inspired interactive bio + macOS-style bottom dock + first-class writing.  
**Static Astro only** (`output: 'static'`). Deploy `dist/` to **Hostinger Custom HTML**. Not WordPress.

`SPEC.md` is the source of truth for product/design.

## Quick start

Requires **Node.js ≥ 22.12**.

```bash
cd chad-personal-site
npm install
npm run dev          # http://localhost:4321
npm run build        # → dist/
npm run preview      # preview production build
```

Canonical site URL (build-time). **Leave unset** until Hostinger staging hostname exists — otherwise absolute canonical/OG/RSS/sitemap stay relative or localhost and do not bake `chadunderwood.com` early.

```bash
npm run build                                          # no SITE_URL yet (local / pre-staging)
SITE_URL=https://YOUR-STAGING-HOST npm run build       # Hostinger free subdomain
SITE_URL=https://chadunderwood.com npm run build       # production cutover later
```

## Routes

| Path | Notes |
|------|--------|
| `/` | Interactive bio (≥10 hotspots, discovery counter, secret word) |
| `/writing`, `/writing/[slug]` | Essay index + Markdown posts |
| `/rss.xml` | Writing RSS |
| `/work` | Selected work |
| `/photos` | Placeholders OK |
| `/now` | Now page |
| `/signal` | Short posts / microblog (Chad) |
| `/guestbook` | 301 → `/signal/` |
| `/colophon` | Stack, credits, sound toggle (default off) |
| `/secret` | Soft-gated (localStorage unlock from bio), `noindex`, out of sitemap |
| `/sitemap-index.xml` | Via `@astrojs/sitemap` (excludes secret) |

## Content

- Bio hotspots: `src/content/bio.json`
- Essays: `src/content/writing/*.md` (frontmatter: `title`, `date`, `updated`, `edition`, `summary`, `example`)
- Now: `src/content/now.md`
- Work: `src/content/work.json`
- Social / Elsewhere: `src/content/social.json`
- Guestbook approved: `src/content/guestbook/approved.json`
- Site meta / email placeholder: `src/content/site.json`

## Drafts → publish → Hostinger

1. Configure webhook + shared secret (see `docs/drafts-publish.js`).
2. Drafts Action POSTs essay JSON → commits Markdown to GitHub.
3. CI builds static site → deploys `dist/` to Hostinger.

Full steps: **`docs/DEPLOY.md`**.

## Features (SPEC §6)

- Discovery counter + visited styles (`localStorage`)
- Secret unmarked hotspot → `/secret`
- Dock on all pages with custom SVG icons
- Writing badge (unseen latest) + reading-progress glow on essays
- Elsewhere stack, time-of-day `data-period`, optional UI sound (default off)
- Essay editions labeling
- Keyboard accessible dock / hotspots / panels / elsewhere
- `prefers-reduced-motion` respected; page bottom padding for dock

## Placeholders to replace

- Email in `src/content/site.json`
- Social URLs in `src/content/social.json`
- Final bio copy in `src/content/bio.json`
- Sample essays marked `example: true` (or delete)
- Guestbook form `action` endpoint
- Photo assets on `/photos`
- Work case blurbs

## License

Private — Chad Underwood.
