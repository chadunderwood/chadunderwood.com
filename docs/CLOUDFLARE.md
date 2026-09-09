# Cloudflare Pages + publish API

Production target: **Cloudflare Pages** (`chadunderwood`) + **Pages Functions** on `https://chadunderwood.com/api/*`.

## Build / deploy

```bash
export CLOUDFLARE_API_TOKEN=…   # never commit
export CLOUDFLARE_ACCOUNT_ID=…   # env / local secrets only — never commit
SITE_URL=https://chadunderwood.com npm run build
npx wrangler@latest pages deploy dist --project-name=chadunderwood
```

`wrangler.toml` binds KV:

| Binding | Purpose |
|---------|---------|
| `SIGNAL_POSTS` | JSON array key `posts` → `{id,date,body}[]` (`id` = `YYYYMMDDHHMMSS` UTC) |
| `WRITING_POSTS` | keys by slug → writing JSON |

## PUBLISH_SECRET

```bash
# Interactive (preferred):
npx wrangler@latest pages secret put PUBLISH_SECRET --project-name=chadunderwood
```

Drafts (iOS/Mac): create Credential named **`PUBLISH_SECRET`** (password field)
with the **exact same** value as the Pages secret. Scripts:
`docs/drafts-api-writing.js`, `docs/drafts-api-signal.js`, `docs/drafts-api-delete.js`, `docs/drafts-api-import.js`
read that Credential and send both Bearer + `body.secret`.

401 responses are JSON: `{ ok:false, error:"unauthorized", hint:"…" }` (no secret values).

## API contract

### Publish / update — `POST https://chadunderwood.com/api/publish`

- Auth: `Authorization: Bearer <secret>` **and/or** JSON `body.secret` (both trimmed; either may match)
- Body:
  ```json
  { "type": "writing"|"signal", "action": "create"|"update",
    "title?:", "slug?:", "body?:", "status?:", "id?:", "secret?:" }
  ```
- Response: `{ ok, url, id|slug }` or `{ ok:false, error, hint? }`
- `action: "delete"` is **rejected** — use `/api/delete` instead.

### Safe delete — `POST https://chadunderwood.com/api/delete`

Separate from publish. Requires an exact `confirm` match.

- Auth: same as publish
- Body:
  ```json
  { "type": "writing"|"signal", "slug?": "…", "id?": "…",
    "confirm": "<exact slug or id>", "secret?": "…" }
  ```
- `confirm` **must equal** the `slug` (writing) or `id` (signal). Mismatch → 400 `confirm_required`.
- Drafts: `docs/drafts-api-delete.js` — paste slug or YYYYMMDDHHMMSS (type inferred) → type `DELETE <same-key>`.

Reads (public):

- `GET /api/signal` → posts array
- `GET /api/writing` → list (no full body)
- `GET /api/writing/:slug` → post

## Seed KV from repo

```bash
node scripts/seed-kv.mjs
```

## Custom domain

Pages project custom domain `chadunderwood.com` (and `www` if needed). Zone already on Cloudflare (look up **Zone ID** in the dashboard; keep it in env only — never commit). Apex should CNAME-flatten / alias to `chadunderwood.pages.dev` (orange cloud).

## Git connect (optional later)

Connect GitHub `chadunderwood/chadunderwood.com` in the Pages dashboard for push-to-deploy. Until then, use `wrangler pages deploy dist`.

## Drafts import (edit existing)

Public GETs — paste into Drafts Actions:

| Script | Input | Effect |
|--------|-------|--------|
| `docs/drafts-api-import.js` | paste slug or YYYYMMDDHHMMSS (14 digits → Signal; else Writing) | fills body; meta set |

Then publish with `action=update` via `drafts-api-writing.js` / `drafts-api-signal.js`, or **safe-delete** via `drafts-api-delete.js` (paste key → infer type → `DELETE <key>` → `/api/delete`).

Drafts Action setup: [DRAFTS.md](./DRAFTS.md).
