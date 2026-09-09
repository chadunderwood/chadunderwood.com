// Drafts Action — Import Writing or Signal into this draft for edit/delete
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Flow (Prompt):
//   1) Choose Writing or Signal
//   2) Enter writing slug OR paste Signal YYYYMMDDHHMMSS (mono code under /signal/)
//   3) Draft body (+ meta) filled for update / safe-delete
//
// Auth: none (public GET APIs)

const WRITING_API = 'https://chadunderwood.com/api/writing/';
const SIGNAL_API = 'https://chadunderwood.com/api/signal';

function metaPrefill() {
  try {
    const meta = String(draft.meta || '').trim();
    if (!meta) return '';
    if (meta.indexOf(':') > 0) return meta.split(':').slice(1).join(':').trim();
    return meta;
  } catch (e) {
    return '';
  }
}

function promptType() {
  const p = Prompt.create();
  p.title = 'Import to edit';
  p.message = 'What do you want to import?';
  p.addButton('Writing');
  p.addButton('Signal');
  p.isCancellable = true;
  if (!p.show()) return null;
  const b = String(p.buttonPressed || '').toLowerCase();
  if (b.indexOf('writing') === 0) return 'writing';
  if (b.indexOf('signal') === 0) return 'signal';
  return null;
}

function promptKey(type, prefill) {
  const p = Prompt.create();
  p.title = type === 'writing' ? 'Import Writing' : 'Import Signal';
  p.message =
    type === 'writing'
      ? 'Enter the writing slug (path under /writing/).'
      : 'Paste the YYYYMMDDHHMMSS mono code shown under the post on /signal/.';
  p.addTextField('key', type === 'writing' ? 'Slug' : 'Signal id', prefill || '');
  p.addButton('Import');
  p.isCancellable = true;
  if (!p.show()) return null;
  return String((p.fieldValues && p.fieldValues.key) || '').trim();
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

const type = promptType();
if (!type) {
  // cancelled
} else {
  const key = promptKey(type, metaPrefill());
  if (!key) {
    if (key !== null) alert('Import: missing slug/id.');
  } else if (type === 'writing') {
    importWriting(key.replace(/^\/+|\/+$/g, ''));
  } else {
    importSignal(key);
  }
}
