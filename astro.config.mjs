// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import vercel from '@astrojs/vercel';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

/**
 * Cible de déploiement.
 *
 * Le site tourne pour l'instant sur Vercel, et pourra basculer sur Cloudflare
 * Pages. Les deux adaptateurs sont donc conservés, sélectionnés par la
 * variable DEPLOY_TARGET — les formats de sortie sont incompatibles entre
 * plateformes, on ne peut pas en produire un seul qui convienne aux deux.
 *
 *   DEPLOY_TARGET=cloudflare npm run build
 *
 * Par défaut : vercel.
 */
const CIBLE = (process.env.DEPLOY_TARGET ?? env.DEPLOY_TARGET ?? 'vercel').toLowerCase();

if (!['vercel', 'cloudflare'].includes(CIBLE)) {
  throw new Error(`DEPLOY_TARGET inconnu : « ${CIBLE} ». Valeurs acceptées : vercel, cloudflare.`);
}

export default defineConfig({
  site: 'https://bellcorenovation.com',

  // Statique par défaut : chaque page est prérendue au build.
  // Seules les routes d'API passent en rendu à la demande, via
  // `export const prerender = false`.
  output: 'static',
  adapter: CIBLE === 'cloudflare' ? cloudflare() : vercel(),

  trailingSlash: 'always',

  /**
   * Redirections des anciennes adresses.
   *
   * Déclarées ici plutôt que dans un fichier propre à une plateforme : Astro
   * les compile en redirections natives pour l'adaptateur actif, elles
   * fonctionnent donc aussi bien sur Vercel que sur Cloudflare Pages.
   *
   * Les pages de spam issues de la compromission ne figurent pas ici : elles
   * doivent répondre 410, ce qu'aucune redirection ne permet d'exprimer. Elles
   * sont traitées par des routes dédiées, dans src/pages/.
   */
  redirects: {
    '/renovation-dappartement': { status: 301, destination: '/services/renovation-appartement/' },
    '/renovation-de-maison-villa': { status: 301, destination: '/services/renovation-maison-villa/' },
    '/renovation-de-studio': { status: 301, destination: '/services/renovation-studio/' },
    '/renovation-de-salle-de-bain': { status: 301, destination: '/services/renovation-salle-de-bain/' },
    '/renovation-de-cuisine': { status: 301, destination: '/services/renovation-cuisine/' },
    '/pose-de-carrelage': { status: 301, destination: '/services/pose-carrelage/' },
    '/vitrification-et-poncage-de-parquet': { status: 301, destination: '/services/parquet/' },
    '/bellcoelect': { status: 301, destination: '/services/electricite/' },
    '/travaux-delectricite': { status: 301, destination: '/services/electricite/' },
    /* Pas de règle pour /realisations, /contact ni /blog vers leur version avec
       barre finale : `trailingSlash: 'always'` produit déjà un 308 pour elles.
       Les déclarer ici serait pire qu'inutile — Astro considère alors que la
       redirection possède la route et supprime la page réelle, qui répond 404. */
  },

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
