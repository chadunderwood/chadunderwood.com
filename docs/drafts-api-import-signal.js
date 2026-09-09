// Drafts Action — Import Signal (prefer docs/drafts-api-import.js which auto-infers type)
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Paste YYYYMMDDHHMMSS mono code from /signal/. Auth: none (public GET /api/signal)

const API = 'https://chadunderwood.com/api/signal';

function resolveIdHint() {
  let id = '';
  try {
    id = String(draft.meta || '').trim();
    if (/^signal:/i.test(id)) id = id.replace(/^signal:/i, '').trim();
  } catch (e) {}
  if (!id) {
    try {
      id = String(draft.processTemplate('[[id]]') || draft.processTemplate('[[slug]]') || '').trim();
    } catch (e) {}
  }
  return id;
}

function promptId(prefill) {
  const p = Prompt.create();
  p.title = 'Import Signal';
  p.message = 'Paste the YYYYMMDDHHMMSS mono code shown under the post on /signal/.';
  p.addTextField('id', 'Signal id', prefill || '');
  p.addButton('Import');
  p.isCancellable = true;
  if (!p.show()) return null;
  return String((p.fieldValues && p.fieldValues.id) || '').trim();
}

const want = promptId(resolveIdHint());
if (want === null) {
  // cancelled
} else if (!want) {
  alert('Signal import: paste the YYYYMMDDHHMMSS mono code from /signal/.');
} else if (!/^\d{14}$/.test(want)) {
  alert('Signal import: expected 14-digit YYYYMMDDHHMMSS. Use docs/drafts-api-import.js for writing slugs.');
} else {
  const http = HTTP.create();
  const response = http.request({
    url: API,
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const code = response.statusCode || response.responseCode || 0;
  let posts = null;
  try {
    posts = JSON.parse(String(response.responseText || response.responseData || ''));
  } catch (e) {}

  if (code === 200 && Array.isArray(posts)) {
    let found = null;
    for (let i = 0; i < posts.length; i++) {
      if (String((posts[i] || {}).id || '') === want) {
        found = posts[i];
        break;
      }
    }
    if (!found) {
      alert('Signal import: no post with id "' + want + '".');
    } else {
      try {
        draft.content = String(found.body || '');
        draft.meta = String(found.id || want);
        draft.update();
      } catch (e) {
        alert('Signal import: loaded OK but could not write draft.\n' + String(e).slice(0, 200));
      }
      alert('Imported signal → ' + (found.id || want) + '\nEdit+update with drafts-api-signal.js (action=update).');
    }
  } else {
    alert(
      'Signal import failed HTTP ' +
        code +
        '\n' +
        String((posts && posts.error) || response.responseText || response.responseData || '').slice(0, 300),
    );
  }
}
