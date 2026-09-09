#!/usr/bin/env node
/**
 * Prepend a Signal microblog post to src/content/signal/posts.json
 * Payload via DRAFTS_PAYLOAD env (JSON) or file arg. Zero npm deps.
 *
 * Auth: repository_dispatch already requires a GitHub PAT.
 * client_payload.secret is ignored if present (optional legacy field).
 */
import fs from 'node:fs';
import path from 'node:path';

const SITE = process.env.SITE_URL || 'https://chadunderwood.com';
const postsPath = path.resolve('src/content/signal/posts.json');

function slugify(text) {
  return String(text || 'signal')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'signal';
}

function loadPayload() {
  if (process.env.DRAFTS_PAYLOAD) return JSON.parse(process.env.DRAFTS_PAYLOAD);
  const file = process.argv[2];
  if (!file) throw new Error('Pass payload via DRAFTS_PAYLOAD or file arg');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function annotate(level, message) {
  const clean = String(message).replace(/\r?\n/g, ' ').replace(/%/g, '%25');
  console.log(`::${level}::${clean}`);
}

const payload = loadPayload();
const keys = payload && typeof payload === 'object' ? Object.keys(payload) : [];
const bodyRaw = payload?.body;
const body = String(bodyRaw ?? '').trim();

annotate(
  'notice',
  `signal-diag keys=${keys.join('|') || '(none)'} bodyLen=${body.length} secretIgnored=true`,
);

if (!body) {
  annotate(
    'error',
    `signal-diag bodyLen=0 keys=${keys.join('|') || '(none)'} — client_payload.body empty/missing`,
  );
  process.exit(1);
}

const id = slugify(payload.id || body.slice(0, 40));
const date = payload.date || new Date().toISOString();

let posts = [];
if (fs.existsSync(postsPath)) {
  const raw = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  posts = Array.isArray(raw) ? raw : [];
}

posts = posts.filter((p) => p && p.id !== id);
posts.unshift({ id, date, body });

fs.mkdirSync(path.dirname(postsPath), { recursive: true });
fs.writeFileSync(postsPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');

const url = `${SITE.replace(/\/$/, '')}/signal/`;
console.log(url);
console.log(`Wrote signal post id=${id} (${posts.length} posts)');
