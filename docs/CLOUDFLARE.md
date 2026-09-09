# Cloudflare Pages + publish API

Production target: **Cloudflare Pages** (`chadunderwood`) + **Pages Functions** on `https://chadunderwood.com/api/*`.

Hostinger remains on disk but is unused after DNS cutover.

## Build / deploy

```bash
export CLOUDFLARE_API_TOKEN=…   # never commit
export CLOUDFLARE_ACCOUNT_ID=25395a6bd9cd24fda57e33c2754bc4d0
SITE_URL=https://chadunderwood.com npm run build
npx wrangler@latest pages deploy dist --project-name=chadunderwood
```

`wrangler.toml` binds KV:

| Binding | Purpose |
|---------|---------|
| `SIGNAL_POSTS` | JSON array key `posts` → `{id,date,body}[]` |
| `WRITING_POSTS` | keys by slug → writing JSON |

## PUBLISH_SECRET

```bash
# Interactive (preferred):
npx wrangler@latest pages secret put PUBLISH_SECRET --project-name=chadunderwood

# Or paste the same value into Drafts scripts:
#   docs/drafts-api-writing.js
#   docs/drafts-api-signal.js
#   docs/drafts-api-delete.js
```

Use the **same** secret Chad already uses as `DRAFTS_PUBLISH_SECRET` if desired.

## API contract

`POST https://chadunderwood.com/api/publish`

- Auth: `Authorization: Bearer <secret>` **or** `body.secret`
- Body:
  ```json
  { "type": "writing"|"signal", "action": "create"|"update"|"delete",
    "title?:", "slug?:", "body?:", "status?:", "id?:" }
  ```
- Response: `{ ok, url, id|slug }`

Reads (public):

- `GET /api/signal` → posts array
- `GET /api/writing` → list (no full body)
- `GET /api/writing/:slug` → post

## Seed KV from repo

```bash
node scripts/seed-kv.mjs
```

## Custom domain

Pages project custom domain `chadunderwood.com` (and `www` if needed). Zone already on Cloudflare (`82d5427d70be7a04fcb33a341c0acb63`). Apex should CNAME-flatten / alias to `chadunderwood.pages.dev` (orange cloud).

## Git connect (optional later)

Connect GitHub `chadunderwood/chadunderwood.com` in the Pages dashboard for push-to-deploy. Until then, use `wrangler pages deploy dist`.
