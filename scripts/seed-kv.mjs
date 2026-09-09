#!/usr/bin/env node
/**
 * ONE-TIME / recovery seed of Cloudflare KV from repo fixtures.
 *
 * LIVE KV is the source of truth for Writing + Signal (Drafts → /api/publish).
 * This script must NOT run on normal deploys.
 *
 * Default: fill only missing keys / empty Signal list. Never overwrite existing live posts.
 * Danger: SEED_KV_FORCE=1 or --force replaces live KV with repo snapshots.
 *
 * Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const FORCE = process.env.SEED_KV_FORCE === '1' || process.argv.includes('--force');
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

async function kvGet(ns, key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${ns}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${key} HTTP ${res.status}`);
  return await res.text();
}

async function kvPut(ns, key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${ns}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'text/plain' },
    body: typeof value === 'string' ? value : JSON.stringify(value),
  });
  const data = await res.json();
  if (!data.success) throw new Error(JSON.stringify(data.errors));
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const signalPath = path.join(root, 'src/content/signal/posts.json');
const writingDir = path.join(root, 'src/content/writing');

console.log(FORCE ? 'MODE: FORCE overwrite live KV from git' : 'MODE: safe — skip existing live keys');

const repoPosts = JSON.parse(fs.readFileSync(signalPath, 'utf8'));
const liveSignalRaw = await kvGet(SIGNAL_KV, 'posts');
let liveSignal = [];
try {
  liveSignal = liveSignalRaw ? JSON.parse(liveSignalRaw) : [];
  if (!Array.isArray(liveSignal)) liveSignal = [];
} catch {
  liveSignal = [];
}

if (FORCE) {
  await kvPut(SIGNAL_KV, 'posts', JSON.stringify(repoPosts));
  console.log('FORCE seeded SIGNAL_POSTS posts:', repoPosts.length);
} else if (liveSignal.length === 0) {
  await kvPut(SIGNAL_KV, 'posts', JSON.stringify(repoPosts));
  console.log('Seeded empty SIGNAL_POSTS from repo:', repoPosts.length);
} else {
  console.log('SKIP Signal seed — live KV already has', liveSignal.length, 'posts (export live→git if you need a backup)');
}

const files = fs.readdirSync(writingDir).filter((f) => f.endsWith('.md'));
let wrote = 0;
let skipped = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(writingDir, file), 'utf8');
  const { data, content } = matter(raw);
  if (data.draft) continue;
  const slug = file.replace(/\.md$/, '');
  const existing = await kvGet(WRITING_KV, slug);
  if (existing && !FORCE) {
    skipped++;
    continue;
  }
  const post = {
    title: String(data.title || slug).replace(/^#+\s*/, '').trim(),
    slug,
    body: content.trim(),
    status: 'published',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    updated: data.updated ? new Date(data.updated).toISOString() : undefined,
    edition: data.edition || 1,
    tags: data.tags || [],
    summary: data.summary || '',
  };
  await kvPut(WRITING_KV, slug, JSON.stringify(post));
  wrote++;
}
console.log('Writing seed wrote:', wrote, 'skipped existing:', skipped);
if (!FORCE) {
  console.log('Tip: never run this on deploy. Live KV wins. Use --force only for disaster recovery.');
}
