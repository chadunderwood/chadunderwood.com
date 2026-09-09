import type { Env, WritingPost } from '../_lib/auth';

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanTitle(s: string): string {
  return String(s || '').replace(/^#+\s*/, '').trim();
}

/** Minimal markdown → HTML (headings, paragraphs, bold/italic, links, code). */
function mdToHtml(md: string): string {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (!para.length) return;
    const text = para.join(' ').trim();
    if (text) out.push('<p>' + inline(text) + '</p>');
    para = [];
  };
  const inline = (t: string) =>
    escapeHtml(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(
        /\[([^\]]+)\]\((https?:[^)]+)\)/g,
        '<a href="$2" rel="noopener noreferrer">$1</a>',
      );

  for (const line of lines) {
    if (/^\s*$/.test(line)) {
      flush();
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      flush();
      const level = h[1].length;
      out.push(`<h${level}>` + inline(h[2]) + `</h${level}>`);
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flush();
      out.push('<hr class="hairline" />');
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return out.join('\n');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!slug || slug.includes('.') || slug === 'index') {
    return context.next();
  }

  const raw = await context.env.WRITING_POSTS.get(slug);
  if (!raw) {
    return context.next();
  }

  let post: WritingPost;
  try {
    post = JSON.parse(raw) as WritingPost;
  } catch {
    return context.next();
  }
  if (post.status === 'draft') return context.next();

  const displayTitle = cleanTitle(post.title || slug);
  const title = escapeHtml(displayTitle);
  const dateLabel = formatDate(post.date);
  const bodyHtml = mdToHtml(post.body || '');
  const desc = escapeHtml(cleanTitle(post.summary || displayTitle || ''));
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${title} · Chad Underwood</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="https://chadunderwood.com/writing/${encodeURIComponent(slug)}/" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/site.css" />
  <script>
    (function () {
      try {
        var theme = localStorage.getItem('cu:theme');
        if (theme !== 'light' && theme !== 'dark') theme = 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        var h = new Date().getHours();
        var p = h >= 5 && h < 8 ? 'dawn' : h >= 8 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'dusk' : 'night';
        document.documentElement.setAttribute('data-period', p);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  </script>
  <style>
    /* Compact nav for KV essays (full dock lives on Astro pages) */
    .essay-nav {
      display: flex; flex-wrap: wrap; gap: 0.75rem 1.1rem;
      margin: 0 0 2rem; font-size: 0.9rem; color: var(--text-muted);
    }
    .essay-nav a { text-decoration: none; }
    .essay-nav a[aria-current="page"] { color: var(--text); font-weight: 550; }
    .essay-header { margin-bottom: 2rem; }
  </style>
</head>
<body data-essay-progress="1">
  <a class="sr-only" href="#main">Skip to content</a>
  <main id="main">
    <article class="page prose" data-essay>
      <nav class="essay-nav" aria-label="Site">
        <a href="/">Home</a>
        <a href="/writing/" aria-current="page">Writing</a>
        <a href="/signal/">Signal</a>
        <a href="/now/">Now</a>
      </nav>
      <header class="essay-header">
        <h1 class="page-title">${title}</h1>
        <p class="meta"><time datetime="${escapeHtml(post.date)}">${escapeHtml(dateLabel)}</time></p>
      </header>
      ${bodyHtml}
      <hr class="hairline" />
      <p class="meta"><a href="/writing/">← All writing</a></p>
    </article>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
