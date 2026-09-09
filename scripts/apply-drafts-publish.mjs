#!/usr/bin/env node
/**
 * Reads Drafts publish payload from env DRAFTS_PAYLOAD (JSON string)
 * or from a file path arg, writes/updates src/content/writing/<slug>.md
 * Prints the public URL to stdout.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

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

function yamlDumpFrontmatter(data) {
  // Minimal YAML writer for our known fields
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

const title = String(payload.title || '').trim() || 'Untitled';
const slug = slugify(payload.slug || title);
const body = String(payload.body || '').trim();
const status = String(payload.status || 'published').toLowerCase();
const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
const shouldUpdate = payload.updated !== false; // default true for republish

fs.mkdirSync(writingDir, { recursive: true });
const filePath = path.join(writingDir, `${slug}.md`);
const exists = fs.existsSync(filePath);

let date = todayISODate();
let edition = 1;
let summary = payload.summary ? String(payload.summary).trim() : undefined;

if (exists && shouldUpdate) {
  const prev = matter(fs.readFileSync(filePath, 'utf8'));
  if (prev.data?.date) {
    const d = prev.data.date;
    date = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  }
  edition = Number(prev.data?.edition || 1) + 1;
  if (!summary && prev.data?.summary) summary = String(prev.data.summary);
} else if (exists && !shouldUpdate) {
  // overwrite without bumping date if forced create-like
  const prev = matter(fs.readFileSync(filePath, 'utf8'));
  if (prev.data?.date) {
    const d = prev.data.date;
    date = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  }
  edition = Number(prev.data?.edition || 1);
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
