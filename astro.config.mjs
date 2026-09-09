// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL at build time for staging/prod absolute canonicals, OG, RSS, sitemap.
// Leave unset until Hostinger staging hostname exists so we don't bake chadunderwood.com early.
const site = process.env.SITE_URL || undefined;

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : {}),
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/secret'),
    }),
  ],
});
