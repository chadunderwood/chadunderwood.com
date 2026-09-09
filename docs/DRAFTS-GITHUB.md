# Drafts → GitHub → chadunderwood.com

Publish from Drafts on iPhone/Mac into this repo. GitHub Actions writes
`src/content/writing/<slug>.md`, commits to `main`, and the deploy workflow
builds Astro and SFTPs `dist/` to Hostinger.

## One-time GitHub setup

1. Create empty public (or private) repo: `https://github.com/chadunderwood/chadunderwood.com`
2. Push this workspace as `main` (Dev will do this once Gary confirms auth).
3. Create a **fine-grained or classic PAT** for Drafts with `repo` scope
   (needs `contents: write` via the Actions bot for the commit; the PAT is only
   used to call `repository_dispatch`).
4. Repo **Settings → Secrets and variables → Actions** — add:

| Secret | Example / notes |
|--------|-----------------|
| `HOSTINGER_HOST` | `31.170.167.87` |
| `HOSTINGER_PORT` | `65002` |
| `HOSTINGER_USER` | `u809453245` |
| `HOSTINGER_SSH_KEY` | Full private key PEM (same key that SSHs to Hostinger) |
| `HOSTINGER_REMOTE_PATH` | Absolute path to production docroot ending in `/` (e.g. `domains/chadunderwood.com/public_html/`) |
| `DRAFTS_PUBLISH_SECRET` | Long random string; same value in Drafts Action body |

Deploy uses rsync over SSH and **excludes** `wp-content/` so essay images under
`wp-content/uploads` stay put.

## Drafts Action (iOS)

Create an Action (e.g. “Publish to chadunderwood.com”) with:

**Step 1 — Script (JavaScript):** paste `docs/drafts-publish.js` (builds JSON).

**Step 2 — HTTP:**

- Method: `POST`
- URL: `https://api.github.com/repos/chadunderwood/chadunderwood.com/dispatches`
- Headers:
  - `Authorization: Bearer <YOUR_GITHUB_PAT>`
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
  - `Content-Type: application/json`
- Body (Template): use the script output, or inline:

```json
{
  "event_type": "drafts-publish",
  "client_payload": {
    "secret": "SAME_AS_DRAFTS_PUBLISH_SECRET",
    "title": "[[title]]",
    "body": "[[body]]",
    "status": "published",
    "tags": [],
    "updated": true
  }
}
```

GitHub returns **204 No Content** on success (no JSON body). Drafts should
show a local success URL you synthesize:

`https://chadunderwood.com/writing/<slug>/`

(slug = slugified title, same rules as the site). Live HTML appears after the
`drafts-publish` workflow commits and `Build & deploy` finishes (~1–3 min).

### Optional: omit bare PAT in Drafts

If you prefer not to store a PAT in Drafts, use a thin Cloudflare Worker /
Vercel function that checks `DRAFTS_PUBLISH_SECRET` and calls the GitHub
dispatches API with a server-side PAT. Same `event_type` + `client_payload`.

## Manual test

GitHub → Actions → **Drafts publish** → Run workflow → fill title/body → Run.
Then watch **Build & deploy** on the resulting push.

## Payload shape (SPEC §3.2)

```json
{
  "secret": "…",
  "title": "string",
  "slug": "optional-override",
  "body": "markdown",
  "status": "published",
  "tags": ["optional"],
  "summary": "optional",
  "updated": true
}
```

Same slug republishes: bumps `edition`, sets `updated`, keeps original `date`.

## Publish to Signal

Microblog posts go to `src/content/signal/posts.json` (newest prepended).

**Drafts Action name:** `Publish to Signal`

1. **Script** — paste `docs/drafts-signal-publish.js` (set `PUBLISH_SECRET`).
2. **HTTP POST** — same as Writing:
   - URL: `https://api.github.com/repos/chadunderwood/chadunderwood.com/dispatches`
   - Headers: `Authorization: Bearer <PAT>`, `Accept: application/vnd.github+json`, `Content-Type: application/json`
   - Body: script output (`event_type`: `signal-publish`)

Workflow: `.github/workflows/signal-publish.yml` → commits `posts.json` → Build & deploy.

Synthesize success URL: `https://chadunderwood.com/signal/` (GitHub returns 204).
