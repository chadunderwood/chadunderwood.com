#!/usr/bin/env node
/**
 * Reads Drafts publish payload from env DRAFTS_PAYLOAD (JSON string)
 * or from a file path arg, writes/updates src/content/writing/<slug>.md
 * Prints the public URL to stdout.
 * Zero npm deps (so GitHub Actions can run without npm ci).
 */
import fs from 'node:fs';
import path from 'node:path';

const SITE = process.env.SITE_URL || 'https://chadunderwood.com';
const writingDir = path.resolve('src/content/writing');

function slugify(title) {
  return String(title || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function loadPayload() {
  if (process.env.DRAFTS_PAYLOAD) {
    return JSON.parse(process.env.DRAFTS_PAYLOAD);
  }
  const file = process.argv[2];
  if (!file) throw new Error('Pass payload JSON via DRAFTS_PAYLOAD or file arg');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseExistingFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const data = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      try { val = JSON.parse(val.startsWith("'") ? JSON.stringify(val.slice(1, -1)) : val); } catch { val = val.slice(1, -1); }
    } else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^\d+$/.test(val)) val = Number(val);
    data[key] = val;
  }
  return { data, body };
}

function yamlDumpFrontmatter(data) {
  const lines = ['---'];
  const quote = (s) => JSON.stringify(String(s));
  lines.push(`title: ${quote(data.title)}`);
  lines.push(`date: ${data.date}`);
  if (data.updated) lines.push(`updated: ${data.updated}`);
  lines.push(`edition: ${data.edition}`);
  if (data.summary) lines.push(`summary: ${quote(data.summary)}`);
  lines.push(`draft: ${data.draft ? 'true' : 'false'}`);
  if (data.example) lines.push(`example: true`);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  if (tags.length) {
    lines.push('tags:');
    for (const t of tags) lines.push(`  - ${quote(t)}`);
  } else {
    lines.push('tags: []');
  }
  lines.push('---', '');
  return lines.join('\n');
}

const payload = loadPayload();
const expectedSecret = process.env.DRAFTS_PUBLISH_SECRET || '';
if (expectedSecret) {
  const got = payload.secret || '';
  if (got !== expectedSecret) {
    console.error('Invalid publish secret');
    process.exit(1);
  }
}

let title = String(payload.title || '').trim() || 'Untitled';
// Drafts often sends "# Title" as the title line — strip leading markdown heading markers
title = title.replace(/^#+\s+/, '').trim() || 'Untitled';
const slug = slugify(payload.slug || title);
let body = String(payload.body || '').trim();
// If body empty but title was a full draft, keep empty; if body starts with same heading, strip it
if (body.startsWith('#')) {
  body = body.replace(/^#+\s+[^\n]+\n+/, '').trim();
}
const status = String(payload.status || 'published').toLowerCase();
const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
const shouldUpdate = payload.updated !== false;

fs.mkdirSync(writingDir, { recursive: true });
const filePath = path.join(writingDir, `${slug}.md`);
const exists = fs.existsSync(filePath);

let date = todayISODate();
let edition = 1;
let summary = payload.summary ? String(payload.summary).trim() : undefined;

if (exists) {
  const prev = parseExistingFrontmatter(fs.readFileSync(filePath, 'utf8'));
  if (prev.data?.date) date = String(prev.data.date).slice(0, 10);
  edition = Number(prev.data?.edition || 1);
  if (shouldUpdate) edition += 1;
  if (!summary && prev.data?.summary) summary = String(prev.data.summary);
}

const updated = exists ? todayISODate() : date;
const draft = status !== 'published';

const fm = {
  title,
  date,
  updated,
  edition,
  summary,
  draft,
  tags,
};

const md = `${yamlDumpFrontmatter(fm)}${body}\n`;
fs.writeFileSync(filePath, md, 'utf8');

const url = `${SITE.replace(/\/$/, '')}/writing/${slug}/`;
console.log(url);
console.log(`Wrote ${path.relative(process.cwd(), filePath)} (edition ${edition}, draft=${draft})`);
