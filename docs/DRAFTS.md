# Drafts → chadunderwood.com

Paste these **Script** actions from `docs/` into Drafts (line 1 must stay a `//` comment):

| Action | File |
|--------|------|
| Publish Writing | `docs/drafts-api-writing.js` |
| Publish Signal | `docs/drafts-api-signal.js` |
| Import (edit) | `docs/drafts-api-import.js` — paste writing slug **or** Signal `YYYYMMDDHHMMSS` (14 digits → Signal; else Writing) |
| Safe delete | `docs/drafts-api-delete.js` — same key + type `DELETE <key>` → `POST /api/delete` |

Auth: Drafts Credential **`PUBLISH_SECRET`** = Cloudflare Pages secret **`PUBLISH_SECRET`**. Scripts send `Authorization: Bearer` and JSON `body.secret`.

Signal post ids are **`YYYYMMDDHHMMSS` (UTC)** — shown as mono code under each `/signal/` post (copy for import/delete).

API details: [CLOUDFLARE.md](./CLOUDFLARE.md).
