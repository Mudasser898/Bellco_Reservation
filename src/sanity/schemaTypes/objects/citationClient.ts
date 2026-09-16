import { defineField, defineType } from 'sanity';

/** Citation d'un client, rattachée à une réalisation. */
export const citationClient = defineType({
  name: 'citationClient',
  title: 'Citation du client',
  type: 'object',
  fields: [
    defineField({
      name: 'texte',
      title: 'Citation',
      type: 'text',
      rows: 4,
      description: 'Les mots du client, sans guillemets : ils sont ajoutés à l’affichage.',
      validation: (Rule) => Rule.max(400),
    }),
    defineField({ name: 'nom', title: 'Prénom du client', type: 'string' }),
    defineField({ name: 'commune', title: 'Commune', type: 'string' }),
  ],
  preview: {
    select: { title: 'texte', nom: 'nom', commune: 'commune' },
    prepare: ({ title, nom, commune }) => ({
      title: title ?? 'Citation',
      subtitle: [nom, commune].filter(Boolean).join(' · '),
    }),
  },
});
