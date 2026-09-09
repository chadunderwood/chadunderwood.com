// Drafts Action — Publish / update Writing via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Auth: Cloudflare Pages secret name = PUBLISH_SECRET
// Drafts Credential name = PUBLISH_SECRET (Settings → Credentials → password)
// API accepts BOTH:
//   Authorization: Bearer <secret>
//   JSON body.secret
// Paste the SAME value in Pages and in the Drafts Credential.
// Update: set [[action]]=update (or draft tag) so action is "update";
//   keep slug/id in draft.meta (import scripts set this).

const PUBLISH_URL = 'https://chadunderwood.com/api/publish';
// Fallback only if Credential missing — leave placeholder; prefer Credential "PUBLISH_SECRET"
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

function slugify(title) {
  return (
    String(title || 'untitled')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  );
}

let title = '';
let body = '';
try {
  title = draft.processTemplate('[[title]]');
} catch (e) {}
try {
  body = draft.processTemplate('[[body]]');
} catch (e) {}
if (!body) {
  try {
    body = draft.content || '';
  } catch (e) {}
}
title = String(title || '').replace(/^#+\s*/, '').trim();
body = String(body || '').trim();

let slug = '';
try {
  slug = String(draft.meta || '').trim();
} catch (e) {}
if (!slug) slug = slugify(title);

let action = 'create';
try {
  const tag = String(draft.processTemplate('[[action]]') || '').trim().toLowerCase();
  if (tag === 'update' || tag === 'create') action = tag;
} catch (e) {}

const PUBLISH_SECRET = resolvePublishSecret();

if (!title && action === 'create') {
  alert('Writing publish: title is empty.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert(
    'Writing publish: set Drafts Credential "PUBLISH_SECRET" (same value as Cloudflare Pages secret PUBLISH_SECRET).',
  );
} else {
  const requestBody = {
    type: 'writing',
    action: action,
    title: title,
    slug: slug,
    body: body,
    status: 'published',
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
    alert('Writing live → ' + (parsed.url || 'https://chadunderwood.com/writing/' + slug + '/'));
  } else {
    alert(
      'Writing publish failed HTTP ' +
        code +
        '\n' +
        String((parsed && (parsed.error || parsed.hint)) || response.responseText || response.responseData || '').slice(
          0,
          400,
        ),
    );
  }
}
