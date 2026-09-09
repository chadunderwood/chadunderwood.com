// Drafts Action — Import Writing (prefer docs/drafts-api-import.js which auto-infers type)
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Paste/enter a writing slug. Auth: none (public GET /api/writing/:slug)

const API = 'https://chadunderwood.com/api/writing/';

function resolveSlugHint() {
  let slug = '';
  try {
    slug = String(draft.meta || '').trim();
    if (/^writing:/i.test(slug)) slug = slug.replace(/^writing:/i, '').trim();
  } catch (e) {}
  if (!slug) {
    try {
      slug = String(draft.processTemplate('[[slug]]') || '').trim();
    } catch (e) {}
  }
  return slug.replace(/^\/+|\/+$/g, '');
}

function promptSlug(prefill) {
  const p = Prompt.create();
  p.title = 'Import Writing';
  p.message = 'Enter the writing slug (path under /writing/).';
  p.addTextField('slug', 'Slug', prefill || '');
  p.addButton('Import');
  p.isCancellable = true;
  if (!p.show()) return null;
  return String((p.fieldValues && p.fieldValues.slug) || '').trim().replace(/^\/+|\/+$/g, '');
}

const slug = promptSlug(resolveSlugHint());
if (slug === null) {
  // cancelled
} else if (!slug) {
  alert('Writing import: enter a slug (e.g. thoughts-on-the-2026-apple-event).');
} else if (/^\d{14}$/.test(slug)) {
  alert('That looks like a Signal id. Use docs/drafts-api-import.js (or import-signal) instead.');
} else {
  const http = HTTP.create();
  const response = http.request({
    url: API + encodeURIComponent(slug),
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const code = response.statusCode || response.responseCode || 0;
  let parsed = null;
  try {
    parsed = JSON.parse(String(response.responseText || response.responseData || ''));
  } catch (e) {}

  if (code === 200 && parsed && parsed.title != null) {
    const title = String(parsed.title || '')
      .replace(/^#+\s*/, '')
      .trim();
    const body = String(parsed.body || '');
    const text = title ? '# ' + title + '\n\n' + body : body;
    try {
      draft.content = text;
      draft.meta = String(parsed.slug || slug);
      draft.update();
    } catch (e) {
      alert('Writing import: loaded OK but could not write draft.\n' + String(e).slice(0, 200));
    }
    alert('Imported writing → ' + (parsed.slug || slug) + '\nEdit, then publish with action=update.');
  } else {
    alert(
      'Writing import failed HTTP ' +
        code +
        '\n' +
        String((parsed && parsed.error) || response.responseText || response.responseData || '').slice(0, 300),
    );
  }
}
