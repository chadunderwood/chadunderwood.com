// Drafts Action — Publish / update Writing via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Set PUBLISH_SECRET to the same value as Cloudflare Pages secret PUBLISH_SECRET
// (Drafts Credential or paste). Same secret as Signal.

const PUBLISH_URL = 'https://chadunderwood.com/api/publish';
const PUBLISH_SECRET = 'REPLACE_WITH_PUBLISH_SECRET';

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
title = String(title || '').trim();
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

if (!title && action === 'create') {
  alert('Writing publish: title is empty.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert('Writing publish: set PUBLISH_SECRET (same as Cloudflare PUBLISH_SECRET).');
} else {
  const requestBody = {
    type: 'writing',
    action: action,
    title: title,
    slug: slug,
    body: body,
    status: 'published',
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
        String((parsed && parsed.error) || response.responseText || response.responseData || '').slice(0, 300),
    );
  }
}
