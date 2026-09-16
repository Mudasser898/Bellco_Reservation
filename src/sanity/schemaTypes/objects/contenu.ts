import { defineArrayMember, defineType } from 'sanity';

/**
 * Texte riche (portable text) utilisé par les services, réalisations et
 * articles. Volontairement restreint : pas de H1 (chaque page n'en a qu'un,
 * posé par le gabarit), pas de couleur ni de taille libres — la mise en forme
 * reste celle du système de design.
 */
export const contenu = defineType({
  name: 'contenu',
  title: 'Contenu',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraphe', value: 'normal' },
        { title: 'Titre de section', value: 'h2' },
        { title: 'Sous-titre', value: 'h3' },
        { title: 'Citation', value: 'blockquote' },
      ],
      lists: [
        { title: 'Liste à puces', value: 'bullet' },
        { title: 'Liste numérotée', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
        ],
        annotations: [
          {
            name: 'lien',
            type: 'object',
            title: 'Lien',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'Adresse',
                validation: (Rule: any) =>
                  Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({ type: 'imageAvecAlt' }),
  ],
});
