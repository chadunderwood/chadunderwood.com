// Drafts Action — Import Signal from chadunderwood.com into this draft for edit/delete
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Flow: Prompt for YYYYMMDDHHMMSS id (prefills draft.meta / [[id]] / first line if present).
// Prefer docs/drafts-api-import.js for a Writing vs Signal chooser.
//
// Auth: none (public GET /api/signal)

const API = 'https://chadunderwood.com/api/signal';

function resolveIdHint() {
  let id = '';
  try {
    id = String(draft.meta || '').trim();
    if (id.indexOf('signal:') === 0) id = id.slice(7).trim();
  } catch (e) {}
  if (!id) {
    try {
      id = String(draft.processTemplate('[[id]]') || draft.processTemplate('[[slug]]') || '').trim();
    } catch (e) {}
  }
  if (!id) {
    try {
      const lines = String(draft.content || '').split('\n');
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const m = lines[i].match(/^\s*(id|slug|code)\s*[:=]\s*(.+)\s*$/i);
        if (m) {
          id = m[2].trim();
          break;
        }
        if (!id && lines[i].trim() && lines[i].indexOf(' ') < 0 && lines[i].indexOf(':') < 0) {
          id = lines[i].trim();
          break;
        }
      }
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
} else if (!want || want.indexOf('REPLACE_') === 0) {
  alert('Signal import: paste the YYYYMMDDHHMMSS mono code from /signal/.');
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
    const wantLower = want.toLowerCase();
    let found = null;
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i] || {};
      const pid = String(p.id || '');
      if (pid === want || pid.toLowerCase() === wantLower) {
        found = p;
        break;
      }
    }
    if (!found) {
      alert(
        'Signal import: no post with id "' +
          want +
          '". Copy the YYYYMMDDHHMMSS mono code under the post on /signal/.',
      );
    } else {
      try {
        draft.content = String(found.body || '');
        draft.meta = String(found.id || want);
        draft.update();
      } catch (e) {
        alert('Signal import: loaded OK but could not write draft.\n' + String(e).slice(0, 200));
      }
      alert('Imported signal → ' + (found.id || want) + '\nEdit+update or safe-delete using this id.');
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
