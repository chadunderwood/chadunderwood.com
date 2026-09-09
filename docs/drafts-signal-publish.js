// Drafts Action — Script step (JavaScript)
// "Publish to Signal" — posts the whole draft to /signal/
//
// HTTP step (same as Writing):
//   POST https://api.github.com/repos/chadunderwood/chadunderwood.com/dispatches
//   Authorization: Bearer <PAT with repo>
//   Accept: application/vnd.github+json
//   Content-Type: application/json
//   Body: this script's return value
//
// Set PUBLISH_SECRET = GitHub Actions secret DRAFTS_PUBLISH_SECRET

const PUBLISH_SECRET = 'REPLACE_WITH_DRAFTS_PUBLISH_SECRET';

// Prefer full draft text; fall back to [[body]] / [[draft]]
let body = '';
try {
  body = draft.content || '';
} catch (e) {}
if (!body) {
  try { body = draft.processTemplate('[[draft]]'); } catch (e) {}
}
if (!body) {
  try { body = draft.processTemplate('[[body]]'); } catch (e) {}
}
body = String(body || '').trim();

function slugify(text) {
  return String(text || 'signal')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'signal';
}

const id = slugify(body.slice(0, 40));
const publicUrl = 'https://chadunderwood.com/signal/';

const requestBody = {
  event_type: 'signal-publish',
  client_payload: {
    secret: PUBLISH_SECRET,
    id,
    body,
  },
};

console.log(publicUrl);
draft.setTemplateTag('cu_publish_url', publicUrl);
draft.setTemplateTag('cu_dispatch_body', JSON.stringify(requestBody));

JSON.stringify(requestBody);
