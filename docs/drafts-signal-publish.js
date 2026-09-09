// Drafts Action — "Publish to Signal"
// Step 1: Script (this file). Step 2: HTTP POST (see below).
//
// event_type: signal-publish
// PUBLISH_URL: https://api.github.com/repos/chadunderwood/chadunderwood.com/dispatches
// Headers: Authorization: Bearer <PAT>, Accept: application/vnd.github+json,
//          Content-Type: application/json
// Body: return value of this script
//
// Set PUBLISH_SECRET to the same value as GitHub Actions secret DRAFTS_PUBLISH_SECRET.
// alert only — no context.success / context.fail (compat with Chad's Drafts build).

const PUBLISH_SECRET = 'REPLACE_WITH_DRAFTS_PUBLISH_SECRET';

function slugify(text) {
  return String(text || 'signal')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'signal';
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

if (!body) {
  alert('Signal publish: draft is empty.');
  '';
} else {
  const id = slugify(body.slice(0, 40));
  const publicUrl = 'https://chadunderwood.com/signal/';

  const requestBody = {
    event_type: 'signal-publish',
    client_payload: {
      secret: PUBLISH_SECRET,
      id: id,
      body: body,
    },
  };

  alert('Publishing to Signal → ' + publicUrl + '\n(GitHub returns 204; live after deploy.)');

  try {
    draft.setTemplateTag('cu_publish_url', publicUrl);
    draft.setTemplateTag('cu_dispatch_body', JSON.stringify(requestBody));
  } catch (e) {}

  JSON.stringify(requestBody);
}
