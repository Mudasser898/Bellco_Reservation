/**
 * Configuration du Studio Sanity, servi à /studio.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';

/* Ne pas lever ici : cette configuration est évaluée pendant la construction,
   et une exception ferait échouer tout le déploiement alors que le reste du
   site n'a pas besoin du CMS. Le Studio, lui, affichera l'erreur dans le
   navigateur — c'est le bon endroit pour la voir. */
const projectIdEffectif = projectId || 'ffffffff';

export default defineConfig({
  name: 'bellco',
  title: 'Bellco Rénovation',
  projectId: projectIdEffectif,
  dataset,
  basePath: '/studio',
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    /** Empêche la création d'un second document « Réglages ». */
    templates: (prev) => prev.filter((t) => t.schemaType !== 'settings'),
  },
  document: {
    /** Retire « Réglages » du bouton de création global. */
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'settings'),
  },
});
