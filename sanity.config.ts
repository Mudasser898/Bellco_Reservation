/**
 * Configuration du Studio Sanity, servi à /studio.
 *
 * Les schémas (projet, service, article, commune, témoignage, réglages)
 * arrivent à l'étape 2 ; ce fichier n'expose pour l'instant que la structure.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

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
  plugins: [structureTool()],
  schema: { types: [] },
});
