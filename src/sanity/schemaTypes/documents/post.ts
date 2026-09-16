import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Article de blog',
  type: 'document',
  groups: [
    { name: 'contenu', title: 'Contenu', default: true },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      group: 'contenu',
      validation: (Rule) => Rule.required().max(110),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de l’article',
      type: 'slug',
      group: 'contenu',
      options: { source: 'titre', maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'extrait',
      title: 'Chapeau',
      type: 'text',
      rows: 3,
      group: 'contenu',
      description: 'Le résumé affiché dans la liste des articles et dans les résultats Google.',
      validation: (Rule) => Rule.required().min(60).max(300),
    }),
    defineField({
      name: 'image',
      title: 'Image de couverture',
      type: 'imageAvecAlt',
      group: 'contenu',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contenu',
      title: 'Article',
      type: 'contenu',
      group: 'contenu',
    }),
    defineField({
      name: 'datePublication',
      title: 'Date de publication',
      type: 'datetime',
      group: 'contenu',
      options: { dateFormat: 'DD/MM/YYYY' },
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'auteur',
      title: 'Auteur',
      type: 'string',
      group: 'contenu',
      initialValue: 'Bellco Rénovation',
    }),
    defineField({
      name: 'categorie',
      title: 'Catégorie',
      type: 'string',
      group: 'contenu',
      options: {
        list: [
          { title: 'Conseils travaux', value: 'conseils' },
          { title: 'Budget et devis', value: 'budget' },
          { title: 'Réglementation', value: 'reglementation' },
          { title: 'Nos chantiers', value: 'chantiers' },
        ],
      },
    }),
    defineField({
      name: 'metaTitle',
      title: 'Titre pour Google',
      type: 'string',
      group: 'seo',
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Description pour Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (Rule) => Rule.max(170),
    }),
  ],
  orderings: [
    {
      title: 'Plus récent d’abord',
      name: 'dateDesc',
      by: [{ field: 'datePublication', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'titre', date: 'datePublication', media: 'image' },
    prepare: ({ title, date, media }) => ({
      title: title as string,
      subtitle: date ? new Date(date as string).toLocaleDateString('fr-FR') : 'Sans date',
      media,
    }),
  },
});
