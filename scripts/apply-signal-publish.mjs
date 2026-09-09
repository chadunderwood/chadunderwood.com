#!/usr/bin/env node
/**
 * Prepend a Signal microblog post to src/content/signal/posts.json
 * Usage: node scripts/apply-signal-publish.mjs [payload.json]
 *    or: DRAFTS_PAYLOAD='{...}' node scripts/apply-signal-publish.mjs
 * Prefer file arg in CI (avoids env JSON corruption).
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
  if (process.argv[2]) {
    return JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  }
  if (process.env.DRAFTS_PAYLOAD) {
    return JSON.parse(process.env.DRAFTS_PAYLOAD);
  }
  throw new Error('Pass payload JSON file arg or DRAFTS_PAYLOAD env');
}

function diag(msg) {
  console.error(msg);
  console.error(`::notice::${String(msg).replace(/\r?\n/g, ' ')}`);
}

const payload = loadPayload();
const expectedSecret = String(process.env.DRAFTS_PUBLISH_SECRET || '').trim();
const gotSecret = String((payload && payload.secret) || '').trim();
const keys = payload && typeof payload === 'object' ? Object.keys(payload) : [];
const body = String((payload && payload.body) || '').trim();

diag(
  `signal-diag keys=${keys.join('|') || '(none)'} bodyLen=${body.length} secretLen=${gotSecret.length} expectedLen=${expectedSecret.length} secretMatches=${expectedSecret ? gotSecret === expectedSecret : 'n/a'}`,
);

if (expectedSecret && gotSecret !== expectedSecret) {
  console.error('::error::signal-diag secretMatches=false — PUBLISH_SECRET must equal Actions DRAFTS_PUBLISH_SECRET');
  process.exit(1);
}

if (!body) {
  console.error('::error::signal-diag bodyLen=0 — client_payload.body empty/missing');
  process.exit(1);
}

const id = slugify((payload && payload.id) || body.slice(0, 40));
const date = (payload && payload.date) || new Date().toISOString();

let posts = [];
if (fs.existsSync(postsPath)) {
  const raw = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  posts = Array.isArray(raw) ? raw : [];
}

posts = posts.filter((p) => p && p.id !== id);
posts.unshift({ id: id, date: date, body: body });

fs.mkdirSync(path.dirname(postsPath), { recursive: true });
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2) + '\n', 'utf8');

const url = SITE.replace(/\/$/, '') + '/signal/';
// URL must be first stdout line (Writing pattern)
console.log(url);
console.log('Wrote signal post id=' + id + ' (' + posts.length + ' posts)');
