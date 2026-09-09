// Drafts Action — Import Writing from chadunderwood.com into this draft for edit
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// How to run:
//   1) Put the writing slug in draft.meta OR the first line of the draft OR [[slug]]
//      e.g. meta: hello-internet   or first line: slug: hello-internet
//   2) Run this Action → draft is filled with title + body
//   3) Edit, then run docs/drafts-api-writing.js with [[action]]=update (or tag update)
//
// Auth: none (public GET /api/writing/:slug)

const API = 'https://chadunderwood.com/api/writing/';

function resolveSlug() {
  let slug = '';
  try {
    slug = String(draft.meta || '').trim();
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
          // bare first-line slug
          slug = lines[i].trim();
          break;
        }
      }
    } catch (e) {}
  }
  return slug.replace(/^\/+|\/+$/g, '');
}

const slug = resolveSlug();
if (!slug || slug.indexOf('REPLACE_') === 0) {
  alert('Writing import: set slug in draft.meta, [[slug]], or first line (e.g. hello-internet).');
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
    const title = String(parsed.title || '').replace(/^#+\s*/, '').trim();
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
