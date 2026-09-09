// Drafts Action — Delete Writing or Signal via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Draft first line or [[title]] / meta:
//   type: writing|signal
//   slug or id: target
// Or set draft.meta = "writing:my-slug" or "signal:my-id"
// For Signal: copy the mono id under the post on https://chadunderwood.com/signal/
// (same value as DELETE JSON body.id).
//
// Auth: Drafts Credential name = PUBLISH_SECRET (same as Pages secret PUBLISH_SECRET)
// Sends Authorization: Bearer + JSON body.secret

const PUBLISH_URL = 'https://chadunderwood.com/api/publish';
const PUBLISH_SECRET_FALLBACK = 'REPLACE_WITH_PUBLISH_SECRET';

function resolvePublishSecret() {
  try {
    const cred = Credential.create('PUBLISH_SECRET', 'Pages publish secret for chadunderwood.com');
    cred.addPassword('secret', 'PUBLISH_SECRET');
    if (cred.authorize()) {
      const v = String(cred.getValue('secret') || '').trim();
      if (v) return v;
    }
  } catch (e) {}
  return String(PUBLISH_SECRET_FALLBACK || '').trim();
}

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

const PUBLISH_SECRET = resolvePublishSecret();

if (type !== 'writing' && type !== 'signal') {
  alert('Delete: set type to writing or signal (draft.meta like writing:slug).');
} else if (!key) {
  alert('Delete: missing slug/id.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert('Delete: set Drafts Credential "PUBLISH_SECRET".');
} else {
  const requestBody = {
    type: type,
    action: 'delete',
    secret: PUBLISH_SECRET,
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
        String((parsed && (parsed.error || parsed.hint)) || response.responseText || response.responseData || '').slice(
          0,
          400,
        ),
    );
  }
}
