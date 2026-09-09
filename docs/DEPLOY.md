# Deploy — Chad Underwood personal site

Static Astro site → Hostinger **Custom HTML**. No WordPress. No Node SSR on the host.

## Local build

```bash
npm install
# Leave SITE_URL unset for local/pre-staging so chadunderwood.com is not baked into canonicals.
SITE_URL=https://YOUR-STAGING.hostingersite.com npm run build   # Hostinger staging (unused after CF cutover)
# SITE_URL=https://chadunderwood.com npm run build   # production cutover later (Gary-approved only)
```

Output: `dist/` (upload this folder’s **contents** to Hostinger public_html / Custom HTML root).

Canonicals, OG, RSS, and sitemap use `SITE_URL` / Astro `site` when set.

## Hostinger Custom HTML (manual zip)

1. `npm run build`
2. Zip the **contents** of `dist/` (not the parent folder name if Hostinger expects index at root):

   ```bash
   cd dist && zip -r ../site.zip .
   ```

3. Hostinger hPanel → **Websites** → your domain → **File Manager** or **Custom HTML** upload.
4. Upload/extract so `index.html` sits at the site root.
5. Confirm `/writing/`, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`.

Optional: SFTP sync of `dist/` instead of zip.

## Recommended CI (GitHub Actions → Hostinger)

Preferred publish path (SPEC §3.1 option A):

1. Drafts Action → HTTPS POST with shared secret.
2. Publish endpoint (GitHub App / fine-scoped PAT / `repository_dispatch`) writes `src/content/writing/<slug>.md`.
3. GitHub Action on push to `main`:
   - `npm ci && npm run build`
   - Deploy `dist/` via SFTP/FTP to Hostinger (or Hostinger’s deploy hook).

Never put write credentials in client-side JS. Keep the publish secret server-side only.

### Example Action sketch

```yaml
# .github/workflows/deploy.yml
name: Build & deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          SITE_URL: https://chadunderwood.com
      # Add SFTP/FTP deploy action here (Hostinger credentials in repo secrets)
```

## Guestbook moderation

v1 form ships with honeypot + client placeholder. Wire `action` on the guestbook form to:

- Formspree / Basin / Getform, **or**
- Authenticated Worker that opens a GitHub Issue / writes pending JSON, **or**
- `repository_dispatch` that Chad approves.

Approved entries live in `src/content/guestbook/approved.json` and are committed to the repo, then rebuilt.

## Drafts

See `docs/drafts-publish.js` for the Drafts Action script and JSON contract (SPEC §3.2).

## Checklist

- [ ] `SITE_URL` correct for environment
- [ ] `npm run build` exits 0
- [ ] Secret page excluded from sitemap; `noindex` present
- [ ] Email + social URLs updated in `src/content/site.json` / `social.json`
- [ ] Guestbook endpoint configured (or left as pending placeholder)


## robots.txt on Hostinger free subdomains

Hostinger’s `*.hostingersite.com` staging hosts often **inject** an edge `robots.txt` that includes:

```
User-agent: Googlebot
Disallow: /
```

That can override or mask the file we ship in `dist/robots.txt` (which Disallows `/secret` and, when `SITE_URL` is set, lists the sitemap).

- **Staging (`*.hostingersite.com`):** Hostinger **CDN injects** a synthetic `/robots.txt` (`User-agent: Googlebot` / `Disallow: /`) that never hits origin. Origin LiteSpeed and on-disk `public_html/robots.txt` are SPEC-correct (Allow `/`, Disallow `/secret`, Sitemap). `.htaccess` rewrites `/robots.txt` → `/robots.php` on origin; **`/robots.php` serves SPEC robots**, but the edge still replaces `/robots.txt` for free subdomains. Cannot fully override the edge path from `public_html`.
- **Production (`chadunderwood.com`):** after cutover, verify live `/robots.txt` is **ours** (Allow `/`, Disallow `/secret`, Sitemap). Free-subdomain injection should not apply to the custom domain. If it does, use hPanel SEO/robots settings — do not leave Googlebot Disallow-all on prod.

## Cache after deploy

After uploading `dist/`, purge Hostinger website / LiteSpeed / CDN cache for the target domain so essays and new routes are not transient 404s. Then hard-refresh.

## GitHub Actions (production)

Repo: `https://github.com/chadunderwood/chadunderwood.com` (create empty, then push).

Workflows (do not push until Gary confirms repo + auth):

- `.github/workflows/deploy.yml` — on push to `main`: `npm ci`, build with
  `SITE_URL=https://chadunderwood.com`, rsync `dist/` to Hostinger over SSH.
  Excludes `wp-content/` and `ads.txt` so uploads and ads survive deploys.
- `.github/workflows/drafts-publish.yml` — `repository_dispatch` type
  `drafts-publish` (or manual `workflow_dispatch`): writes
  `src/content/writing/<slug>.md` via `scripts/apply-drafts-publish.mjs`,
  commits to `main` (triggers deploy).

Full Drafts setup: [DRAFTS-GITHUB.md](./DRAFTS-GITHUB.md).

### Required Actions secrets

| Name | Purpose |
|------|---------|
| `HOSTINGER_HOST` | SSH host |
| `HOSTINGER_PORT` | SSH port (repo secret only) |
| `HOSTINGER_USER` | SSH user |
| `HOSTINGER_SSH_KEY` | Private key PEM |
| `HOSTINGER_REMOTE_PATH` | Docroot path for rsync |
| `DRAFTS_PUBLISH_SECRET` | Shared secret in Drafts → workflow |

### Local / box deploy (unchanged)

Still valid for one-off deploys from the box: build with `SITE_URL`, SFTP
`dist/`, preserve `wp-content/uploads`, refresh Hostinger cache if needed.
