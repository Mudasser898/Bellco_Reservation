// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
  site: 'https://bellcorenovation.com',

  // Statique par défaut : chaque page est prérendue au build.
  // Seul /api/devis passe en rendu à la demande via `export const prerender = false`.
  output: 'static',
  adapter: cloudflare(),

  trailingSlash: 'always',

  integrations: [
    react(),
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID ?? '',
      dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2026-01-01',
      // CDN en production uniquement : le build lit la donnée fraîche.
      useCdn: false,
      studioBasePath: '/studio',
    }),
    sitemap({
      filter: (page) => !page.includes('/studio'),
      i18n: undefined,
    }),
  ],

  image: {
    // Les images Sanity sont servies depuis le CDN Sanity.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
