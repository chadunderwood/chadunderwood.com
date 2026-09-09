// Drafts Action — Import Writing from chadunderwood.com into this draft for edit
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Flow: Prompt for slug (prefills draft.meta / [[slug]] / first line if present).
// Prefer docs/drafts-api-import.js for a Writing vs Signal chooser.
//
// Auth: none (public GET /api/writing/:slug)

const API = 'https://chadunderwood.com/api/writing/';

function resolveSlugHint() {
  let slug = '';
  try {
    slug = String(draft.meta || '').trim();
    if (slug.indexOf('writing:') === 0) slug = slug.slice(8).trim();
  } catch (e) {}
  if (!slug) {
    try {
      slug = String(draft.processTemplate('[[slug]]') || '').trim();
    } catch (e) {}
  }
  if (!slug) {
    try {
      const lines = String(draft.content || '').split('\n');
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const m = lines[i].match(/^\s*(slug|id)\s*[:=]\s*(.+)\s*$/i);
        if (m) {
          slug = m[2].trim();
          break;
        }
        if (!slug && lines[i].trim() && lines[i].indexOf(' ') < 0 && lines[i].indexOf(':') < 0) {
          slug = lines[i].trim();
          break;
        }
      }
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
} else if (!slug || slug.indexOf('REPLACE_') === 0) {
  alert('Writing import: enter a slug (e.g. hello-internet).');
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
