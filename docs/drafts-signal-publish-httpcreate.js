// Drafts Action — "Publish to Signal" (script-only, HTTP.create — no HTTP step)
// event_type: signal-publish
// Same DRAFTS_PUBLISH_SECRET as Writing.
// alert only — no context.success / context.fail.

const PUBLISH_SECRET = 'REPLACE_WITH_DRAFTS_PUBLISH_SECRET';
const PUBLISH_URL = 'https://api.github.com/repos/chadunderwood/chadunderwood.com/dispatches';
const PAT = 'REPLACE_WITH_GITHUB_PAT'; // same PAT as Writing (repo scope)

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
body = String(body || '').trim();

if (!body) {
  alert('Signal publish: draft is empty.');
} else if (!PUBLISH_SECRET || PUBLISH_SECRET.indexOf('REPLACE_') === 0) {
  alert('Signal publish: set PUBLISH_SECRET to DRAFTS_PUBLISH_SECRET (same as Writing).');
} else if (!PAT || PAT.indexOf('REPLACE_') === 0) {
  alert('Signal publish: set PAT to your GitHub token (same as Writing).');
} else {
  const id = slugify(body.slice(0, 40));
  const requestBody = {
    event_type: 'signal-publish',
    client_payload: {
      secret: PUBLISH_SECRET,
      id: id,
      body: body,
    },
  };

  const http = HTTP.create();
  const response = http.request({
    url: PUBLISH_URL,
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + PAT,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    data: requestBody,
  });

  const code = response.statusCode || response.responseCode || 0;
  if (code === 204 || code === 200) {
    alert('Signal queued (HTTP ' + code + '). Live soon at https://chadunderwood.com/signal/');
  } else {
    alert(
      'Signal publish failed HTTP ' +
        code +
        '\n' +
        String(response.responseText || response.responseData || '').slice(0, 300),
    );
  }
}
