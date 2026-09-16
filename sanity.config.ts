/**
 * Configuration du Studio Sanity, servi à /studio.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';

if (!projectId) {
  throw new Error(
    'PUBLIC_SANITY_PROJECT_ID est absent. Copiez .env.example vers .env et renseignez-le.',
  );
}

export default defineConfig({
  name: 'bellco',
  title: 'Bellco Rénovation',
  projectId,
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
