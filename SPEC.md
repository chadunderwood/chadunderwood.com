# Chad Underwood — Personal Website
## Developer Build Specification (v1.0)
**Date:** 2026-09-08  
**Status:** Approved for build  
**Owner:** Chad Underwood  
**Design brief origin:** Inspired by Benji Taylor (“a personal website should feel like you’ve briefly left the rest of the internet”) and the interaction model of [ped.ro](https://ped.ro), plus a macOS-style bottom dock.

This document is the source of truth. Build exactly what is specified. Do not substitute a generic portfolio theme, page builder, or WordPress unless Chad explicitly changes hosting/CMS decisions below.

---

## 1. Goals

1. A personal site that feels like leaving the rest of the internet — calm, intentional, slightly playful.
2. **Writing/blogging is first-class**, not an afterthought.
3. Home is a **conversational interactive bio** (ped.ro-like), not a hero/CTA landing page.
4. Primary navigation is a **macOS-style icon dock** fixed to the bottom.
5. Chad writes in **Drafts** and publishes via webhook — he should not need to hand-edit GitHub for routine essays.
6. Deploy to **Cloudflare Pages** (static site + Pages Functions).

---

## 2. Non-goals (v1)

- WordPress / page builders (explicitly not the chosen path for v1).
- Node SSR hosting (not required for v1; static Astro on Pages only).
- Social feed, comments threads with likes, newsletter modals, cookie-wall theater.
- Cloning ped.ro pixel-for-pixel (same *ideas*, original execution and content).

---

## 3. Stack & hosting

| Layer | Choice |
|--------|--------|
| Output | Static HTML/CSS/JS |
| Recommended generator | **Astro** (MDX/Markdown content) — or equivalent static SSG |
| Styling | CSS (or Tailwind); keep bundle small; no heavy UI kits |
| Hosting | **Cloudflare Pages** + Functions (`/api/*`) |
| Content for essays | Markdown/MDX in repo, created/updated by publish pipeline |
| Editor UX | **Drafts** app → HTTP Action → publish endpoint |
| Source control | GitHub repo (`chadunderwood/chadunderwood.com`); deploy via Wrangler / Pages |

### 3.1 Deploy flow (required)

```
Drafts “Publish” action
  → HTTPS POST JSON to https://chadunderwood.com/api/publish
  → Pages Function writes Writing/Signal (KV) with PUBLISH_SECRET
  → Static site on Cloudflare Pages (`wrangler pages deploy` or Git-connected Pages)
```

Safe delete is a separate endpoint: `POST /api/delete` (requires `confirm` = slug/id).

Security: shared secret (`PUBLISH_SECRET`) via `Authorization: Bearer` and/or JSON `body.secret`; reject unsigned requests; never expose write credentials to client/site JS. Account/zone IDs and tokens stay in env only — never commit.

### 3.2 Drafts contract

Drafts Action sends JSON approximately:

```json
{
  "secret": "<shared>",
  "title": "Essay title",
  "slug": "optional-slug",
  "body": "Markdown body…",
  "status": "published",
  "tags": ["optional"],
  "updated": true
}
```

- First line or Drafts title → `title`.
- Body → Markdown (GFM).
- If `slug` omitted, slugify title.
- If file exists and `updated: true` (or same slug), update file and bump edition metadata (see §6.9).
- Response: `201`/`200` with `{ "url": "https://…/writing/slug" }`.

Provide Chad ready-made Drafts Action scripts in `/docs/drafts-api-*.js` (see `docs/DRAFTS.md`).

---

## 4. Information architecture

| Route | Purpose |
|--------|---------|
| `/` | Interactive bio (Home) |
| `/writing` | Essay index |
| `/writing/[slug]` | Essay page |
| `/work` | Selected work / projects |
| `/photos` | Photo collection (can be minimal v1) |
| `/now` | Now page |
| `/guestbook` | Signal / guestbook |
| `/colophon` | How the site is built |
| `/secret` or unlisted path | Hidden page unlocked by secret word (no index, `noindex`) |
| `mailto:` / external | Email & social via dock / Elsewhere stack |

---

## 5. Visual design system

### 5.1 Direction

- **Dark, text-first, modern, minimal** — not warm paper “book blog,” not loud Swiss poster, not generic Linear marketing.
- Reference energy: [ped.ro](https://ped.ro) (conversational type, sparse chrome, playful reveals).
- Large calm margins; comfortable reading measure (~60–70ch for essays).
- Almost no cards, gradients-as-decoration, or glass everywhere *except* the dock.

### 5.2 Color

| Token | Value (starting point) | Use |
|--------|-------------------------|-----|
| `--bg` | `#0C0C0C` | Page background |
| `--bg-elevated` | `#161616` | Panels, guestbook form |
| `--text` | `#F2F2F2` | Primary text |
| `--text-muted` | `#8A8A8A` | Dates, secondary |
| `--hairline` | `#2A2A2A` | Dividers |
| `--accent-a` | soft lavender | Click-word underline set |
| `--accent-b` | soft blue | Click-word underline set |
| `--accent-c` | soft warm/peach | Click-word underline set |
| `--danger/badge` | `#FF453A` | Dock badge |

Exact hex may be tuned; keep contrast WCAG AA for body text.

### 5.3 Typography

- One modern geometric/humanist **sans** for UI + body (e.g. Inter, Geist, or system-ui stack).
- Clear hierarchy: bio lead slightly larger; essay title large but not poster-huge; body ~16–18px, generous line-height (~1.6–1.7).
- No decorative serifs for v1.

### 5.4 Motion

- Short, soft (150–300ms); respect `prefers-reduced-motion`.
- Dock icon hover: subtle macOS-like scale-up (neighbor icons may ease slightly).
- Click-word panel: fade + slight rise.
- Optional UI sounds (§6.4) only when enabled.

### 5.5 Time-of-day theme (§6.10)

Same dark base. Shift tokens slightly by local time:

| Period | Adjustment |
|--------|------------|
| Dawn (~5–8) | `--bg` slightly warmer |
| Day | Neutral baseline |
| Dusk (~17–20) | Slightly cooler / bluer |
| Night | Deepest black, muted accents |

Implement via `data-period` on `<html>` set by small client script. No flash of wrong theme if avoidable (inline boot script).

---

## 6. Features (build all)

### 6.0 Core — Interactive bio (Home)

- Conversational intro copy (final copy TBD with Chad; use placeholder approved tone: direct, human, not corporate).
- **10–15 highlighted words/phrases** in the bio. Each is focusable/clickable.
- On activate: small elevated panel or elegant inline expand with extra detail (project, place, belief). Not a full-screen modal.
- Panel includes title, short text, optional link; dismiss via click-outside, Escape, or close control.
- **Discovery counter** (e.g. `3/12`) fixed top-right (or equivalent discreet corner). Increments once per unique word per visitor (`localStorage`).
- Visited words get a persistent subtle “discovered” style.
- One hotspot is the **secret word** (§6.7) — visually unmarked or nearly unmarked vs others.

**Content model** (JSON or frontmatter), e.g. `content/bio.json`:

```json
{
  "lead": "Yo — I'm Chad Underwood. …",
  "words": [
    {
      "id": "raycast-or-whatever",
      "trigger": "useful software",
      "title": "…",
      "body": "…",
      "href": "https://…",
      "secret": false
    }
  ]
}
```

### 6.0b Core — Bottom dock

Persistent fixed dock, bottom-center, frosted/translucent dark bar, rounded, light border, `backdrop-filter: blur`.

**Icons (v1 set):**

| ID | Label | Target |
|----|--------|--------|
| `home` | Home | `/` |
| `writing` | Writing | `/writing` |
| `work` | Work | `/work` |
| `photos` | Photos | `/photos` |
| `now` | Now | `/now` |
| `guestbook` | Signal | `/guestbook` |
| `elsewhere` | Elsewhere | Opens stack (§6.8) |
| `colophon` | ⌘ / Colophon | `/colophon` |
| `email` | Email | `mailto:` (address TBD) |

- Active route: clear selected state (glow or lifted background).
- Mobile: dock remains usable — horizontal scroll if needed, or compact icon-only with labels on long-press; never cover content unreadably (add bottom padding to pages).
- Icons: colorful, app-like, consistent set (custom SVG preferred over random emoji).

### 6.0c Core — Writing / blog

- `/writing`: list of essays — title, one-line dek, date (and edition if any). No card grid.
- `/writing/[slug]`: long-form Markdown render; dark reading chrome; dock remains.
- Deep links and shareable URLs required.
- RSS feed at `/rss.xml` (or `/writing/rss.xml`).

### 6.1 Now page

- Dock item → `/now`.
- Short, dated “what I’m focused on” page (manual Markdown is fine; optional Drafts target `type: now` later).
- Show last updated timestamp.

### 6.2 Dock badges

- When a visitor has not seen the latest essay, show a small red badge on the Writing dock icon.
- Track last-seen essay id/date in `localStorage`.
- Clear badge when they open `/writing` or the new post.
- Badge must work with static hosting (client-only).

### 6.3 Guestbook / signal

- `/guestbook`: slow, moderated, one-line (or short) notes. No likes, no threading.
- **v1 moderation:** submissions go to pending store; Chad approves before public display.
  - Static-friendly approach: form POSTs to authenticated endpoint / form service / GitHub issue / backend that Chad confirms; approved entries committed as JSON/Markdown.
- Display approved entries chronologically, quiet typography.
- Anti-spam: honeypot + rate limit + secret.

### 6.4 Optional UI sound

- Preference toggle in Colophon or a discreet control (persist `localStorage`).
- **Default: off.**
- Soft ticks on: click-word open, dock app switch (optional).
- Respect reduced motion / user preference; never autoplay music.

### 6.5 Reading-progress glow

- On `/writing/[slug]` only: Writing dock icon fills/glows proportional to scroll progress through the article (0–100%).
- Reset when leaving the post.

### 6.6 Colophon

- `/colophon` (dock ⌘): stack (Astro/etc.), Drafts → Cloudflare publish pipeline, design inspirations (credit ped.ro as inspiration, not a clone), maybe typefaces.
- Include sound toggle here.

### 6.7 Secret word → hidden page

- One bio trigger has `"secret": true` and is **not** styled like other hotspots (or only a hair different).
- Discovering it unlocks `/secret` (or random unguessable path stored in config). Set `localStorage` flag; show a quiet cue.
- Hidden page: personal letter, odd project, photos — content TBD. `noindex,nofollow`.
- Counter still increments when found.

### 6.8 Elsewhere stack

- Elsewhere dock icon opens a **fan/stack** above the dock (macOS stack metaphor): X, Instagram, GitHub, LinkedIn, Bluesky, etc. (final list TBD).
- Click outside or second tap closes.
- External links `rel="noopener noreferrer"`.

### 6.9 Essay editions

- Frontmatter supports:

```yaml
title: "…"
date: 2026-09-08
updated: 2026-10-01
edition: 2
summary: "…"
```

- Index and post show quiet `v2 · Updated Oct 1, 2026` (or similar) when `edition > 1` or `updated` ≠ `date`.
- Drafts republish to same slug bumps `edition` and `updated`.

### 6.10 Time-of-day theme

See §5.5. Required for v1 (subtle is fine).

---

## 7. Work & Photos (minimum viable)

**Work (`/work`):** simple list or short case blurbs — title, role, link, one line. Match dark typographic style. No case-study theater required for v1.

**Photos (`/photos`):** grid or quiet filmstrip; optimize images; lazy-load. Can ship with 0–3 placeholders if assets pending.

---

## 8. Content placeholders (until Chad provides)

- Site name / domain: TBD (use `chadunderwood.com` or placeholder in env).
- Email: TBD.
- Social URLs: TBD.
- Bio final copy: TBD (keep structure for hotspots).
- First essays: ship with 1–2 sample posts marked as examples, or empty state “Writing soon.”

---

## 9. Accessibility & quality bar

- Keyboard: dock items, click-words, panels, Elsewhere stack all operable.
- Focus visible on dark UI.
- Panels announced appropriately (dialog semantics or disclosure pattern).
- Images have alt text.
- Lighthouse: strong performance on mobile; aim 90+ performance for static content pages.
- No layout shift from dock (reserve padding-bottom).

---

## 10. SEO & meta

- Per-page title/description.
- Open Graph images (simple generated or static default).
- Canonical URLs.
- Secret page excluded from sitemap + `noindex`.

---

## 11. Repo structure (suggested)

```
/
  public/
  src/
    components/
      Dock.astro (or .tsx)
      Bio.astro + BioInteractions.ts
      ElsewhereStack.ts
      ThemePeriod.ts
    content/
      writing/*.md
      bio.json
      now.md
      guestbook/approved/*.json
      work.json
    layouts/Base.astro
    pages/…
  docs/
    drafts-api-*.js
    DRAFTS.md
    CLOUDFLARE.md
    DEPLOY.md
  SPEC.md          ← this file
```

---

## 12. Acceptance criteria (definition of done)

- [ ] Static build deploys cleanly to Cloudflare Pages.
- [ ] Home bio with ≥10 hotspots, counter, persistence, secret word unlock path.
- [ ] Dock on all primary pages; active states correct; mobile usable.
- [ ] Writing index + post template + RSS.
- [ ] Drafts publish path documented and working (test essay live).
- [ ] Now, Guestbook (submit + moderated publish), Colophon shipped.
- [ ] Elsewhere stack works.
- [ ] Badges + reading-progress glow + optional sound + editions + time-of-day theme verified.
- [ ] No WordPress/page-builder dependency.
- [ ] README: local dev, env secrets, Cloudflare deploy, Drafts setup for Chad.

---

## 13. Phasing (same scope, suggested order)

All features above are **in scope**. Suggested implementation order to reduce risk:

1. Shell: design tokens, Base layout, Dock, routing stubs  
2. Home bio + counter + panels  
3. Writing + Markdown pipeline  
4. Cloudflare Pages deploy + Drafts `/api/publish`  
5. Now, Work, Photos, Colophon  
6. Elsewhere stack, badges, progress glow, sound, time-of-day  
7. Guestbook moderation path  
8. Secret word + hidden page  

---

## 14. Out of scope unless requested

- i18n
- Auth/login for Chad beyond publish secret
- Comments on essays
- E-commerce
- CMS admin UI beyond Drafts + Git

---

## 15. Contacts / handoff

- Product/design decisions: Chad (via Lars / this chat history)
- WP specialist exists on Chad’s team (**Dev**) but **v1 is not WordPress**
- Inspiration links: https://ped.ro — https://x.com/benjitaylor/status/2096656821591413161

---

*End of specification.*
