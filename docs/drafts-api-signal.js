// Drafts Action — Publish / update Signal via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Auth: Cloudflare Pages secret name = PUBLISH_SECRET
// Drafts Credential name = PUBLISH_SECRET (Settings → Credentials → password)
// API accepts BOTH Authorization: Bearer <secret> AND JSON body.secret
// Update: set [[action]]=update (or draft tag) so action is "update";
//   keep slug/id in draft.meta (import scripts set this).

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

function slugify(text) {
  return (
    String(text || 'signal')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'signal'
  );
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

let id = '';
try {
  id = String(draft.meta || '').trim();
} catch (e) {}
if (!id) id = slugify(body.slice(0, 40));

let action = 'create';
try {
  const tag = String(draft.processTemplate('[[action]]') || '').trim().toLowerCase();
  if (tag === 'update' || tag === 'create') action = tag;
} catch (e) {}

const PUBLISH_SECRET = resolvePublishSecret();

if (!body) {
  alert('Signal publish: draft is empty.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert(
    'Signal publish: set Drafts Credential "PUBLISH_SECRET" (same value as Cloudflare Pages secret PUBLISH_SECRET).',
  );
} else {
  const requestBody = {
    type: 'signal',
    action: action,
    id: id,
    body: body,
    secret: PUBLISH_SECRET,
  };

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
    alert('Signal live → ' + (parsed.url || 'https://chadunderwood.com/signal/') + '\nid: ' + (parsed.id || id));
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
