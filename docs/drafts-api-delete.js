// Drafts Action — SAFE DELETE (Writing or Signal)
// Separate from publish. Calls POST /api/delete (not /api/publish).
// HTTP.create only — alert on success/fail; no context.success / context.fail
//
// Flow:
//   1) Paste writing slug OR Signal YYYYMMDDHHMMSS (mono code under /signal/)
//   2) Type is inferred: 14 digits → Signal; otherwise → Writing
//   3) Confirm by typing: DELETE <same-slug-or-id>
//
// Auth: Drafts Credential PUBLISH_SECRET (same as Pages secret)
// Sends Authorization: Bearer + JSON body.secret + confirm

const DELETE_URL = 'https://chadunderwood.com/api/delete';
const PUBLISH_SECRET_FALLBACK = 'REPLACE_WITH_PUBLISH_SECRET';
const SIGNAL_ID_RE = /^\d{14}$/;

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

function stripTypePrefix(raw) {
  let s = String(raw || '').trim();
  if (/^writing:/i.test(s)) s = s.replace(/^writing:/i, '').trim();
  else if (/^signal:/i.test(s)) s = s.replace(/^signal:/i, '').trim();
  return s;
}

function keyHint() {
  try {
    const meta = stripTypePrefix(draft.meta || '');
    if (meta) return meta;
  } catch (e) {}
  try {
    const t = String(draft.processTemplate('[[slug]]') || draft.processTemplate('[[id]]') || '').trim();
    if (t) return stripTypePrefix(t);
  } catch (e) {}
  try {
    const lines = String(draft.content || '').split('\n');
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const m = line.match(/^\s*(slug|id|code)\s*[:=]\s*(.+)\s*$/i);
      if (m) return stripTypePrefix(m[2]);
      if (line.indexOf(' ') < 0 && line.indexOf(':') < 0) return stripTypePrefix(line);
    }
  } catch (e) {}
  return '';
}

function inferType(key) {
  return SIGNAL_ID_RE.test(key) ? 'signal' : 'writing';
}

function promptKey(prefill) {
  const p = Prompt.create();
  p.title = 'Safe delete';
  p.message =
    'Paste a Writing slug (e.g. thoughts-on-the-2026-apple-event)\nor a Signal code YYYYMMDDHHMMSS (14 digits under /signal/).\nType is inferred automatically.';
  p.addTextField('key', 'Slug or Signal id', prefill || '');
  p.addButton('Next');
  p.isCancellable = true;
  if (!p.show()) return null;
  return stripTypePrefix((p.fieldValues && p.fieldValues.key) || '');
}

function promptDeleteConfirm(key) {
  const p = Prompt.create();
  p.title = 'Confirm delete';
  p.message = 'This permanently deletes the post.\n\nType exactly:\n\nDELETE ' + key;
  p.addTextField('confirm', 'Confirmation', '');
  p.addButton('Delete');
  p.isCancellable = true;
  if (!p.show()) return null;
  return String((p.fieldValues && p.fieldValues.confirm) || '').trim();
}

function parseConfirmLine(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^DELETE\s+(\S+)\s*$/i);
  return m ? m[1] : '';
}

const keyRaw = promptKey(keyHint());
if (keyRaw === null) {
  // cancelled
} else {
  const key = String(keyRaw || '').replace(/^\/+|\/+$/g, '');
  if (!key) {
    alert('Safe delete: paste a writing slug or 14-digit Signal id.');
  } else {
    const type = inferType(key);
    const confirmRaw = promptDeleteConfirm(key);
    if (confirmRaw === null) {
      // cancelled
    } else {
      const confirmKey = parseConfirmLine(confirmRaw);
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
            draft.meta = key;
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
