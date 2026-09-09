// Drafts Action — SAFE DELETE (Writing or Signal)
// Separate from publish. Calls POST /api/delete (not /api/publish).
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Flow (Prompt — do not rely on draft.meta alone):
//   1) Choose Writing or Signal
//   2) Enter writing slug OR paste Signal YYYYMMDDHHMMSS (mono code under /signal/)
//   3) Confirm by typing: DELETE <same-slug-or-id>
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

function metaPrefill() {
  try {
    const meta = String(draft.meta || '').trim();
    if (!meta) return '';
    if (meta.indexOf(':') > 0) return meta.split(':').slice(1).join(':').trim();
    return meta;
  } catch (e) {
    return '';
  }
}

function promptType() {
  const p = Prompt.create();
  p.title = 'Safe delete';
  p.message = 'What do you want to delete?';
  p.addButton('Writing');
  p.addButton('Signal');
  p.isCancellable = true;
  if (!p.show()) return null;
  const b = String(p.buttonPressed || '').toLowerCase();
  if (b.indexOf('writing') === 0) return 'writing';
  if (b.indexOf('signal') === 0) return 'signal';
  return null;
}

function promptKey(type, prefill) {
  const p = Prompt.create();
  p.title = type === 'writing' ? 'Delete Writing' : 'Delete Signal';
  p.message =
    type === 'writing'
      ? 'Enter the writing slug (path under /writing/).'
      : 'Paste the YYYYMMDDHHMMSS mono code shown under the post on /signal/.';
  p.addTextField('key', type === 'writing' ? 'Slug' : 'Signal id', prefill || '');
  p.addButton('Next');
  p.isCancellable = true;
  if (!p.show()) return null;
  return String((p.fieldValues && p.fieldValues.key) || '').trim();
}

function promptDeleteConfirm(key) {
  const p = Prompt.create();
  p.title = 'Confirm delete';
  p.message =
    'This permanently deletes the post.\n\nType exactly:\n\nDELETE ' + key;
  p.addTextField('confirm', 'Confirmation', '');
  p.addButton('Delete');
  p.isCancellable = true;
  if (!p.show()) return null;
  return String((p.fieldValues && p.fieldValues.confirm) || '').trim();
}

function parseConfirmLine(raw, key) {
  const s = String(raw || '').trim();
  const m = s.match(/^DELETE\s+(\S+)\s*$/i);
  if (m) return m[1];
  return '';
}

const type = promptType();
if (!type) {
  // cancelled
} else {
  const key = promptKey(type, metaPrefill());
  if (!key) {
    if (key !== null) alert('Safe delete: missing slug/id.');
  } else {
    const confirmRaw = promptDeleteConfirm(key);
    if (confirmRaw === null) {
      // cancelled
    } else {
      const confirmKey = parseConfirmLine(confirmRaw, key);
      const PUBLISH_SECRET = resolvePublishSecret();

      if (!confirmKey) {
        alert('Safe delete: type exactly\n\nDELETE ' + key);
      } else if (confirmKey !== key) {
        alert(
          'Safe delete: confirm mismatch.\ntarget: ' +
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
          try {
            draft.meta = type + ':' + key;
            draft.update();
          } catch (e) {}
          alert('Deleted ' + type + ' → ' + key);
        } else {
          alert(
            'Delete failed HTTP ' +
              code +
              '\n' +
              String(
                (parsed && (parsed.error || parsed.hint)) ||
                  response.responseText ||
                  response.responseData ||
                  '',
              ).slice(0, 400),
          );
        }
      }
    }
  }
}
