// Drafts Action — Import Signal from chadunderwood.com into this draft for edit/delete
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// How to run:
//   1) Put the Signal id (mono code under the post on /signal/) in draft.meta
//      OR first line OR [[id]] / [[slug]]
//      e.g. meta: shipping-staging   or first line: id: shipping-staging
//   2) Run this Action → draft body + meta=id filled
//   3) Edit + publish with drafts-api-signal.js action=update
//      or delete with drafts-api-delete.js (type signal, id from meta)
//
// Auth: none (public GET /api/signal)

const API = 'https://chadunderwood.com/api/signal';

function resolveId() {
  let id = '';
  try {
    id = String(draft.meta || '').trim();
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

const want = resolveId();
if (!want || want.indexOf('REPLACE_') === 0) {
  alert('Signal import: set id in draft.meta, [[id]], or first line (copy from /signal/ mono id).');
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
      const pdate = String(p.date || '');
      if (pid === want || pid.toLowerCase() === wantLower) {
        found = p;
        break;
      }
      // allow matching a date prefix / date-code fragment
      if (pdate && (pdate.indexOf(want) === 0 || want.indexOf(pdate.slice(0, 10)) === 0)) {
        found = p;
        break;
      }
    }
    if (!found) {
      alert('Signal import: no post with id "' + want + '". Copy the mono id under the post on /signal/.');
    } else {
      try {
        draft.content = String(found.body || '');
        draft.meta = String(found.id || want);
        draft.update();
      } catch (e) {
        alert('Signal import: loaded OK but could not write draft.\n' + String(e).slice(0, 200));
      }
      alert('Imported signal → ' + (found.id || want) + '\nEdit+update or delete using this id.');
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
