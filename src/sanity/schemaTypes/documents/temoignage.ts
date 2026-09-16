import { defineField, defineType } from 'sanity';

export const temoignage = defineType({
  name: 'temoignage',
  title: 'Témoignage',
  type: 'document',
  fields: [
    defineField({
      name: 'nom',
      title: 'Prénom du client',
      type: 'string',
      description: 'Prénom seul, ou prénom et initiale. Ne publiez pas le nom complet sans accord.',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'commune',
      title: 'Commune',
      type: 'string',
      description: 'Exemple : « Saint-Denis », « Paris 18e ».',
    }),
    defineField({
      name: 'texte',
      title: 'Témoignage',
      type: 'text',
      rows: 5,
      description: 'Les mots du client, sans guillemets : ils sont ajoutés à l’affichage.',
      validation: (Rule) => Rule.required().min(30).max(600),
    }),
    defineField({
      name: 'note',
      title: 'Note sur 5',
      type: 'number',
      options: { list: [1, 2, 3, 4, 5], layout: 'radio', direction: 'horizontal' },
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'typeDeProjet',
      title: 'Type de projet',
      type: 'string',
      description: 'Exemple : « Rénovation complète d’appartement », « Salle de bain ».',
    }),
    defineField({
      name: 'date',
      title: 'Date du témoignage',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
    }),
  ],
  orderings: [
    { title: 'Plus récent d’abord', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'nom', commune: 'commune', note: 'note', texte: 'texte' },
    prepare: ({ title, commune, note, texte }) => ({
      title: [title, commune].filter(Boolean).join(' · '),
      subtitle: (note ? '★'.repeat(note as number) + ' — ' : '') + String(texte ?? '').slice(0, 60),
    }),
  },
});
