// Drafts Action — Publish / update Signal via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Auth: Cloudflare Pages secret name = PUBLISH_SECRET
// Drafts Credential name = PUBLISH_SECRET (Settings → Credentials → password)
// API accepts BOTH Authorization: Bearer <secret> AND JSON body.secret
//
// Create: leave draft.meta empty — server assigns id = YYYYMMDDHHMMSS (UTC).
// Update: set draft.meta to the mono YYYYMMDDHHMMSS under the post on /signal/
//   and [[action]]=update (or tag).

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

let body = '';
try {
  body = draft.content || '';
} catch (e) {}
if (!body) {
  try {
    body = draft.processTemplate('[[draft]]');
  } catch (e) {}
}
if (!body) {
  try {
    body = draft.processTemplate('[[body]]');
  } catch (e) {}
}
body = String(body || '').trim();

let action = 'create';
try {
  const tag = String(draft.processTemplate('[[action]]') || '').trim().toLowerCase();
  if (tag === 'update' || tag === 'create') action = tag;
} catch (e) {}

// update → YYYYMMDDHHMMSS in draft.meta; create → empty (server assigns)
let id = '';
try {
  id = String(draft.meta || '').trim();
} catch (e) {}
if (id && !/^\d{14}$/.test(id)) {
  if (action === 'create') id = '';
}

const PUBLISH_SECRET = resolvePublishSecret();

if (!body) {
  alert('Signal publish: draft is empty.');
} else if (action === 'update' && !/^\d{14}$/.test(id)) {
  alert('Signal update: set draft.meta to the YYYYMMDDHHMMSS code under the post on /signal/.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert(
    'Signal publish: set Drafts Credential "PUBLISH_SECRET" (same value as Cloudflare Pages secret PUBLISH_SECRET).',
  );
} else {
  const requestBody = {
    type: 'signal',
    action: action,
    body: body,
    secret: PUBLISH_SECRET,
  };
  if (id) requestBody.id = id;

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
    const liveId = parsed.id || id || '';
    try {
      if (liveId) {
        draft.meta = liveId;
        draft.update();
      }
    } catch (e) {}
    alert(
      'Signal live → ' +
        (parsed.url || 'https://chadunderwood.com/signal/') +
        '\nid: ' +
        liveId +
        ' (YYYYMMDDHHMMSS — use for delete/import)',
    );
  } else {
    alert(
      'Signal publish failed HTTP ' +
        code +
        '\n' +
        String((parsed && (parsed.error || parsed.hint)) || response.responseText || response.responseData || '').slice(
          0,
          400,
        ),
    );
  }
}
