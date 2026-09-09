# Drafts → chadunderwood.com

**Current path:** Cloudflare Pages Functions (not GitHub `repository_dispatch` / Hostinger).

Paste these Script actions from `docs/` (line 1 must stay a `//` comment):

| Action | File |
|--------|------|
| Publish Writing | `docs/drafts-api-writing.js` |
| Publish Signal | `docs/drafts-api-signal.js` |
| Import (edit) | `docs/drafts-api-import.js` — paste writing slug or Signal `YYYYMMDDHHMMSS` (type inferred) |
| Safe delete | `docs/drafts-api-delete.js` — same key + confirm `DELETE <key>` → `POST /api/delete` |

Auth: Drafts Credential **`PUBLISH_SECRET`** (same value as Pages secret `PUBLISH_SECRET`). Bearer + body.secret.

Full API notes: [CLOUDFLARE.md](./CLOUDFLARE.md).

The old GitHub Actions + Hostinger Drafts scripts (`drafts-publish.js`, `drafts-signal-publish*.js`, `drafts-signal-api.js`) were removed after the Cloudflare cutover.
