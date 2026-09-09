// Drafts Action — SAFE DELETE (Writing or Signal)
// Separate from publish. Calls POST /api/delete (not /api/publish).
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Required:
//   1) Target in draft.meta:
//        writing:<slug>   OR   signal:<id>
//      Signal id = YYYYMMDDHHMMSS mono code under the post on https://chadunderwood.com/signal/
//   2) Confirmation in draft body (first non-empty line):
//        DELETE <same-slug-or-id>
//      Exact match required (case-sensitive for the key).
//
// Auth: Drafts Credential PUBLISH_SECRET (same as Pages secret)
// Sends Authorization: Bearer + JSON body.secret + confirm

const DELETE_URL = 'https://chadunderwood.com/api/delete';
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
  } else if (meta) {
    // bare meta = assume signal id (visible mono code)
    type = 'signal';
    key = meta;
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

// Parse DELETE <key> confirmation from body
let confirmKey = '';
try {
  const lines = String(draft.content || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = line.match(/^DELETE\s+(\S+)\s*$/i);
    if (m) {
      confirmKey = m[1];
      break;
    }
    // stop at first non-empty non-DELETE line (ignore type:/slug: headers above)
    if (/^(type|slug|id)\s*[:=]/i.test(line)) continue;
    break;
  }
} catch (e) {}

const PUBLISH_SECRET = resolvePublishSecret();

if (type !== 'writing' && type !== 'signal') {
  alert('Safe delete: set draft.meta to writing:<slug> or signal:<id> (copy mono id under /signal/).');
} else if (!key) {
  alert('Safe delete: missing slug/id.');
} else if (!confirmKey) {
  alert(
    'Safe delete: add a confirmation line in the draft body:\n\nDELETE ' +
      key +
      '\n\n(Must match the target exactly. This is separate from Publish.)',
  );
} else if (confirmKey !== key) {
  alert(
    'Safe delete: confirm mismatch.\nmeta/target: ' +
      key +
      '\nDELETE line: ' +
      confirmKey +
      '\nBoth must match exactly.',
  );
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert('Safe delete: set Drafts Credential "PUBLISH_SECRET".');
} else {
  const requestBody = {
    type: type,
    confirm: confirmKey,
    secret: PUBLISH_SECRET,
  };
  if (type === 'writing') requestBody.slug = key;
  else requestBody.id = key;

  const http = HTTP.create();
  const response = http.request({
    url: DELETE_URL,
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

  if (code === 200 && parsed && parsed.ok) {
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
