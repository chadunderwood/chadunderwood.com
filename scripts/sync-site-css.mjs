import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
let globalCss = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
globalCss = globalCss.replace('@import "./tokens.css";', '').replace("@import './tokens.css';", '');
const out =
  '/* Stable stylesheet for Pages Functions (KV writing posts) — synced at build */\n' +
  tokens +
  '\n' +
  globalCss;
writeFileSync(join(root, 'public/site.css'), out);
console.log('synced public/site.css');
