import { defineField, defineType } from 'sanity';

export const commune = defineType({
  name: 'commune',
  title: 'Commune',
  type: 'document',
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom de la commune',
      type: 'string',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      options: { source: 'nom', maxLength: 60 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'codePostal',
      title: 'Code postal',
      type: 'string',
      validation: (Rule) =>
        Rule.required().regex(/^\d{5}$/, { name: 'code postal' }).error('Cinq chiffres attendus.'),
    }),
    defineField({
      name: 'description',
      title: 'Présentation de la commune',
      type: 'contenu',
      description:
        'Texte propre à cette commune : type de bâti, contraintes rencontrées, chantiers menés. Évitez de recopier le même texte d’une commune à l’autre — Google le pénalise.',
    }),
    defineField({
      name: 'projetsAssocies',
      title: 'Réalisations mises en avant',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      description:
        'Facultatif. Sans sélection, la page affiche automatiquement les réalisations rattachées à cette commune.',
    }),
    defineField({
      name: 'metaTitle',
      title: 'Titre pour Google',
      type: 'string',
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Description pour Google',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(170),
    }),
  ],
  preview: {
    select: { title: 'nom', subtitle: 'codePostal' },
  },
});
