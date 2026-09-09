// Drafts Action — Delete Writing or Signal via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Draft first line or [[title]] / meta:
//   type: writing|signal
//   slug or id: target
// Or set draft.meta = "writing:my-slug" or "signal:my-id"

const PUBLISH_URL = 'https://chadunderwood.com/api/publish';
const PUBLISH_SECRET = 'REPLACE_WITH_PUBLISH_SECRET';

let type = '';
let key = '';

try {
  const meta = String(draft.meta || '').trim();
  if (meta.indexOf(':') > 0) {
    const parts = meta.split(':');
    type = parts[0].trim().toLowerCase();
    key = parts.slice(1).join(':').trim();
  }
} catch (e) {}

if (!type || !key) {
  try {
    const t = String(draft.processTemplate('[[type]]') || '').trim().toLowerCase();
    const k = String(draft.processTemplate('[[slug]]') || draft.processTemplate('[[id]]') || '').trim();
    if (t) type = t;
    if (k) key = k;
  } catch (e) {}
}

if (!type || !key) {
  // Parse first lines: type=writing / slug=foo
  try {
    const lines = String(draft.content || '').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^\s*(type|slug|id)\s*[:=]\s*(.+)\s*$/i);
      if (m) {
        const k = m[1].toLowerCase();
        const v = m[2].trim();
        if (k === 'type') type = v.toLowerCase();
        else key = v;
      }
    }
  } catch (e) {}
}

if (type !== 'writing' && type !== 'signal') {
  alert('Delete: set type to writing or signal (draft.meta like writing:slug).');
} else if (!key) {
  alert('Delete: missing slug/id.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert('Delete: set PUBLISH_SECRET.');
} else {
  const requestBody = {
    type: type,
    action: 'delete',
  };
  if (type === 'writing') requestBody.slug = key;
  else requestBody.id = key;

  const http = HTTP.create();
  const response = http.request({
    url: PUBLISH_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + PUBLISH_SECRET,
    },
    data: requestBody,
  });

  const code = response.statusCode || response.responseCode || 0;
  let parsed = null;
  try {
    parsed = JSON.parse(String(response.responseText || response.responseData || ''));
  } catch (e) {}

  if ((code === 200 || code === 201) && parsed && parsed.ok) {
    alert('Deleted ' + type + ' → ' + key);
  } else {
    alert(
      'Delete failed HTTP ' +
        code +
        '\n' +
        String((parsed && parsed.error) || response.responseText || response.responseData || '').slice(0, 300),
    );
  }
}
