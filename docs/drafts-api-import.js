// Drafts Action — Import Writing or Signal into this draft for edit
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Flow:
//   1) Paste writing slug OR Signal YYYYMMDDHHMMSS (mono code under /signal/)
//   2) Type is inferred: 14 digits → Signal; otherwise → Writing
//   3) Draft body (+ meta) filled — republish with drafts-api-writing.js / drafts-api-signal.js (action=update)
//
// Auth: none (public GET APIs)

const WRITING_API = 'https://chadunderwood.com/api/writing/';
const SIGNAL_API = 'https://chadunderwood.com/api/signal';
const SIGNAL_ID_RE = /^\d{14}$/;

function stripTypePrefix(raw) {
  let s = String(raw || '').trim();
  if (/^writing:/i.test(s)) s = s.replace(/^writing:/i, '').trim();
  else if (/^signal:/i.test(s)) s = s.replace(/^signal:/i, '').trim();
  return s;
}

function keyHint() {
  try {
    const meta = stripTypePrefix(draft.meta || '');
    if (meta) return meta;
  } catch (e) {}
  try {
    const t = String(draft.processTemplate('[[slug]]') || draft.processTemplate('[[id]]') || '').trim();
    if (t) return stripTypePrefix(t);
  } catch (e) {}
  try {
    const lines = String(draft.content || '').split('\n');
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const m = line.match(/^\s*(slug|id|code)\s*[:=]\s*(.+)\s*$/i);
      if (m) return stripTypePrefix(m[2]);
      if (line.indexOf(' ') < 0 && line.indexOf(':') < 0) return stripTypePrefix(line);
    }
  } catch (e) {}
  return '';
}

function inferType(key) {
  return SIGNAL_ID_RE.test(key) ? 'signal' : 'writing';
}

function promptKey(prefill) {
  const p = Prompt.create();
  p.title = 'Import to edit';
  p.message =
    'Paste a Writing slug (e.g. thoughts-on-the-2026-apple-event)\nor a Signal code YYYYMMDDHHMMSS (14 digits under /signal/).\nType is inferred automatically.';
  p.addTextField('key', 'Slug or Signal id', prefill || '');
  p.addButton('Import');
  p.isCancellable = true;
  if (!p.show()) return null;
  return stripTypePrefix((p.fieldValues && p.fieldValues.key) || '');
}

function importWriting(slug) {
  const http = HTTP.create();
  const response = http.request({
    url: WRITING_API + encodeURIComponent(slug),
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
      return;
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

function importSignal(want) {
  const http = HTTP.create();
  const response = http.request({
    url: SIGNAL_API,
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
        return;
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

const keyRaw = promptKey(keyHint());
if (keyRaw === null) {
  // cancelled
} else {
  const key = String(keyRaw || '').replace(/^\/+|\/+$/g, '');
  if (!key) {
    alert('Import: paste a writing slug or 14-digit Signal id.');
  } else if (inferType(key) === 'signal') {
    importSignal(key);
  } else {
    importWriting(key);
  }
}
