# Chad Underwood — Personal site

Dark, ped.ro-inspired interactive bio + macOS-style bottom dock + first-class writing.

**Static Astro** (`output: 'static'`) on **Cloudflare Pages** + Pages Functions (`/api/*`).  
Canonical docs: [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md) · deploy: [`docs/DEPLOY.md`](docs/DEPLOY.md) · Drafts: [`docs/DRAFTS.md`](docs/DRAFTS.md).

`SPEC.md` is the product/design source of truth (hosting sections updated for Cloudflare).

## Quick start

Requires **Node.js ≥ 22.12**.

```bash
npm install
npm run dev          # http://localhost:4321
SITE_URL=https://chadunderwood.com npm run build   # → dist/
npm run preview
```

Omit `SITE_URL` for local builds if you do not want absolute canonical/OG/RSS/sitemap URLs yet.

## Deploy

```bash
export CLOUDFLARE_API_TOKEN=…    # never commit
export CLOUDFLARE_ACCOUNT_ID=…  # never commit
npx wrangler@latest pages deploy dist --project-name=chadunderwood
```

Details: **`docs/DEPLOY.md`**.

## Routes

| Path | Notes |
|------|--------|
| `/` | Interactive bio |
| `/writing`, `/writing/[slug]` | Essay index + posts (static + KV-backed live essays) |
| `/rss.xml` | Writing RSS |
| `/work` | Selected work |
| `/photos` | Photos |
| `/now` | Now page |
| `/signal` | Short posts / microblog (KV; ids `YYYYMMDDHHMMSS`) |
| `/guestbook` | 301 → `/signal/` |
| `/colophon` | Stack / credits |
| `/secret` | Soft-gated, `noindex` |
| `/api/publish` | Authenticated create/update (Writing / Signal) |
| `/api/delete` | Authenticated safe delete (`confirm` required) |
| `/api/signal`, `/api/writing`, `/api/writing/:slug` | Public reads |

## Content

- Bio hotspots: `src/content/bio.json`
- Essays: `src/content/writing/*.md` (+ KV for live publishes)
- Signal seed: `src/content/signal/posts.json`
- Now: `src/content/now.md`
- Work / social / site: `src/content/work.json`, `social.json`, `site.json`

## Drafts

Paste `docs/drafts-api-*.js` into Drafts Actions. Credential **`PUBLISH_SECRET`** must match the Pages secret. See **`docs/DRAFTS.md`**.

## License

Private — Chad Underwood.
