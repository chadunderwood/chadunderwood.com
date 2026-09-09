// Drafts Action — Script step (JavaScript)
// Builds client_payload for GitHub repository_dispatch → drafts-publish workflow.
//
// Drafts template tags: [[title]], [[body]], etc.
// Set PUBLISH_SECRET to the same value as GitHub secret DRAFTS_PUBLISH_SECRET.
//
// Next step: HTTP POST to
//   https://api.github.com/repos/chadunderwood/chadunderwood.com/dispatches
// Headers: Authorization: Bearer <PAT>, Accept: application/vnd.github+json,
//          Content-Type: application/json
// Body: this script's return value (stringified JSON below is the full request body).

const PUBLISH_SECRET = 'REPLACE_WITH_DRAFTS_PUBLISH_SECRET';

function slugify(title) {
  return String(title || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

const title = draft.processTemplate('[[title]]');
const body = draft.processTemplate('[[body]]');
const slug = slugify(title);
const publicUrl = `https://chadunderwood.com/writing/${slug}/`;

const requestBody = {
  event_type: 'drafts-publish',
  client_payload: {
    secret: PUBLISH_SECRET,
    title,
    slug,
    body,
    status: 'published',
    tags: [],
    updated: true,
  },
};

// Drafts HTTP step uses this as the request body.
// Also surface the URL Drafts can show the user (GitHub returns 204 only).
console.log(publicUrl);
draft.setTemplateTag('cu_publish_url', publicUrl);
draft.setTemplateTag('cu_dispatch_body', JSON.stringify(requestBody));

JSON.stringify(requestBody);
