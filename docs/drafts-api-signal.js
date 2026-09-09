// Drafts Action — Publish / update Signal via Cloudflare Pages Function
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Set PUBLISH_SECRET to the same value as Cloudflare Pages secret PUBLISH_SECRET.

const PUBLISH_URL = 'https://chadunderwood.com/api/publish';
const PUBLISH_SECRET = 'REPLACE_WITH_PUBLISH_SECRET';

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

if (!body) {
  alert('Signal publish: draft is empty.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert('Signal publish: set PUBLISH_SECRET (same as Cloudflare PUBLISH_SECRET).');
} else {
  const requestBody = {
    type: 'signal',
    action: action,
    id: id,
    body: body,
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
        String((parsed && parsed.error) || response.responseText || response.responseData || '').slice(0, 300),
    );
  }
}
