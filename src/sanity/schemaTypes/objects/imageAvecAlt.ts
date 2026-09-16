import { defineField, defineType } from 'sanity';

/**
 * Image avec texte alternatif obligatoire.
 *
 * Toutes les images du site passent par ce type. L'ancien site comptait
 * 39 photos de réalisations sans aucun alt : la contrainte est ici posée
 * dans le schéma, pas laissée à la discipline de l'éditeur.
 *
 * La validation n'exige l'alt que si une image a réellement été déposée,
 * pour ne pas afficher d'erreur sur un emplacement encore vide.
 */
export const imageAvecAlt = defineType({
  name: 'imageAvecAlt',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
      type: 'string',
      description:
        'Décrivez ce que montre la photo, en français, pour les personnes qui ne la voient pas. ' +
        'Exemple : « Salle de bain rénovée avec douche à l’italienne et carrelage gris clair ». ' +
        'Évitez « photo de » ou « image de ».',
      validation: (Rule) =>
        Rule.custom((alt, contexte) => {
          const parent = contexte.parent as { asset?: unknown } | undefined;
          if (!parent?.asset) return true;
          if (!alt || typeof alt !== 'string' || alt.trim().length < 5) {
            return 'Le texte alternatif est obligatoire (5 caractères minimum).';
          }
          if (alt.length > 160) {
            return 'Le texte alternatif ne doit pas dépasser 160 caractères.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'legende',
      title: 'Légende (facultative)',
      type: 'string',
      description: 'Affichée sous la photo. Laissez vide si la photo se suffit à elle-même.',
    }),
  ],
  preview: {
    select: { media: 'asset', title: 'alt', subtitle: 'legende' },
  },
});
