#!/usr/bin/env node
/**
 * Optional backup: export LIVE KV → repo fixtures (never the reverse on deploy).
 * Writes src/content/signal/posts.json and refreshes writing/*.md from KV when present.
 * Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.
 */
import fs from 'node:fs';
import path from 'node:path';

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!ACCOUNT || !TOKEN) {
  console.error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID');
  process.exit(1);
}

function kvIdsFromToml() {
  const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  const ids = {};
  let binding = null;
  for (const line of toml.split('\n')) {
    const b = line.match(/binding\s*=\s*"([^"]+)"/);
    if (b) binding = b[1];
    const id = line.match(/^\s*id\s*=\s*"([^"]+)"/);
    if (id && binding) {
      ids[binding] = id[1];
      binding = null;
    }
  }
  return ids;
}

const ids = kvIdsFromToml();
const SIGNAL_KV = process.env.SIGNAL_KV_ID || ids.SIGNAL_POSTS;
const WRITING_KV = process.env.WRITING_KV_ID || ids.WRITING_POSTS;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

async function kvGet(ns, key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${ns}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${key} HTTP ${res.status}`);
  return await res.text();
}

async function kvList(ns) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${ns}/keys?limit=1000`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await res.json();
  if (!data.success) throw new Error(JSON.stringify(data.errors));
  return (data.result || []).map((k) => k.name);
}

const signalRaw = await kvGet(SIGNAL_KV, 'posts');
const posts = signalRaw ? JSON.parse(signalRaw) : [];
const signalPath = path.join(root, 'src/content/signal/posts.json');
fs.mkdirSync(path.dirname(signalPath), { recursive: true });
fs.writeFileSync(signalPath, JSON.stringify(posts, null, 2) + '\n');
console.log('Exported Signal posts:', posts.length, '→', signalPath);

const writingDir = path.join(root, 'src/content/writing');
fs.mkdirSync(writingDir, { recursive: true });
const keys = await kvList(WRITING_KV);
let n = 0;
for (const slug of keys) {
  const raw = await kvGet(WRITING_KV, slug);
  if (!raw) continue;
  let post;
  try {
    post = JSON.parse(raw);
  } catch {
    continue;
  }
  if (post.status === 'draft') continue;
  const title = String(post.title || slug).replace(/^#+\s*/, '').trim();
  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: ${(post.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10)}`,
    post.updated ? `updated: ${String(post.updated).slice(0, 10)}` : null,
    `edition: ${post.edition || 1}`,
    'draft: false',
    `tags: ${JSON.stringify(post.tags || [])}`,
    post.summary ? `summary: ${JSON.stringify(post.summary)}` : null,
    '---',
    '',
    String(post.body || '').trim(),
    '',
  ]
    .filter((x) => x !== null)
    .join('\n');
  fs.writeFileSync(path.join(writingDir, slug + '.md'), fm);
  n++;
}
console.log('Exported Writing posts:', n, '→', writingDir);
console.log('Commit these only as a backup snapshot — deploys must not seed KV from them.');
