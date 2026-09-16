import { defineField, defineType } from 'sanity';

/** Une entrée de FAQ. Alimente aussi le JSON-LD FAQPage de la page. */
export const questionReponse = defineType({
  name: 'questionReponse',
  title: 'Question / réponse',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'Formulez-la comme un client la poserait.',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'reponse',
      title: 'Réponse',
      type: 'text',
      rows: 5,
      description:
        'Réponse complète et autonome : elle peut être affichée seule dans les résultats Google.',
      validation: (Rule) => Rule.required().min(40),
    }),
  ],
  preview: { select: { title: 'question', subtitle: 'reponse' } },
});
