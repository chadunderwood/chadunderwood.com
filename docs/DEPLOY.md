# Deploy — chadunderwood.com

Production is **Cloudflare Pages** (project `chadunderwood`) + **Pages Functions** under `/api/*`.

Hostinger, SFTP, and GitHub Actions → Hostinger paths are **retired**. Do not use them.

## Build

Requires **Node.js ≥ 22.12**.

```bash
npm install
SITE_URL=https://chadunderwood.com npm run build   # → dist/
```

For local/dev builds you may omit `SITE_URL` (canonical/OG/sitemap stay relative).

## Deploy with Wrangler

```bash
export CLOUDFLARE_API_TOKEN=…      # never commit
export CLOUDFLARE_ACCOUNT_ID=…    # env / local secrets only — never commit
npx wrangler@latest pages deploy dist --project-name=chadunderwood
```

KV bindings and `PUBLISH_SECRET` live on the Pages project (see [CLOUDFLARE.md](./CLOUDFLARE.md)). After changing secrets, redeploy so Functions pick them up.

## Optional: Git-connected Pages

Connect `chadunderwood/chadunderwood.com` in the Pages dashboard for push-to-deploy. Until then, use `wrangler pages deploy dist`.

## Drafts publish / delete / import

Not a deploy step — live Functions:

- Publish/update: `POST /api/publish`
- Safe delete: `POST /api/delete`
- Scripts: [DRAFTS.md](./DRAFTS.md) and `docs/drafts-api-*.js`

## Secrets (names only in git)

| Name | Where |
|------|--------|
| `CLOUDFLARE_API_TOKEN` | Local / CI env (deploy) |
| `CLOUDFLARE_ACCOUNT_ID` | Local / CI env (deploy) |
| `PUBLISH_SECRET` | Pages secret **and** Drafts Credential (same value) |

Never commit account IDs, zone IDs, tokens, or secret values.

## Content vs code deploys

Deploying `dist/` updates **code/static assets only**. It must **not** re-seed
`SIGNAL_POSTS` / `WRITING_POSTS` from git. Live Writing/Signal stay in KV via Drafts.

Do not run `scripts/seed-kv.mjs` as part of deploy. Optional backup: `npm run export-kv`.
