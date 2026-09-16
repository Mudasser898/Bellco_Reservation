import { defineField, defineType } from 'sanity';

/**
 * Réglages du site — document unique (singleton).
 *
 * Alimente le pied de page, les mentions légales et les données structurées
 * LocalBusiness. Les champs « preuves » restent vides tant qu'un chiffre n'est
 * pas vérifiable : le site n'affiche alors simplement rien, plutôt qu'une
 * affirmation inventée.
 */
export const settings = defineType({
  name: 'settings',
  title: 'Réglages du site',
  type: 'document',
  groups: [
    { name: 'coordonnees', title: 'Coordonnées', default: true },
    { name: 'horaires', title: 'Horaires' },
    { name: 'social', title: 'Réseaux sociaux' },
    { name: 'legal', title: 'Mentions légales' },
    { name: 'preuves', title: 'Chiffres et garanties' },
  ],
  fields: [
    defineField({
      name: 'nomEntreprise',
      title: 'Nom commercial',
      type: 'string',
      group: 'coordonnees',
      initialValue: 'Bellco Rénovation',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'telephone',
      title: 'Téléphone (affiché)',
      type: 'string',
      group: 'coordonnees',
      description: 'Tel que le client le lit : 07 66 25 14 36.',
      initialValue: '07 66 25 14 36',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'telephoneInternational',
      title: 'Téléphone (format international)',
      type: 'string',
      group: 'coordonnees',
      description: 'Utilisé par le bouton d’appel et par Google. Format : +33766251436.',
      initialValue: '+33766251436',
      validation: (Rule) =>
        Rule.required().regex(/^\+\d{8,15}$/, { name: 'format international' }),
    }),
    defineField({
      name: 'email',
      title: 'Adresse e-mail',
      type: 'string',
      group: 'coordonnees',
      initialValue: 'contact@bellcorenovation.com',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'adresseRue',
      title: 'Adresse — rue',
      type: 'string',
      group: 'coordonnees',
      initialValue: '235 avenue du Président Wilson',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'adresseCodePostal',
      title: 'Code postal',
      type: 'string',
      group: 'coordonnees',
      initialValue: '93210',
      validation: (Rule) => Rule.required().regex(/^\d{5}$/, { name: 'code postal' }),
    }),
    defineField({
      name: 'adresseVille',
      title: 'Ville',
      type: 'string',
      group: 'coordonnees',
      initialValue: 'Saint-Denis',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'geo',
      title: 'Coordonnées GPS',
      type: 'geopoint',
      group: 'coordonnees',
      description: 'Position exacte transmise à Google pour le référencement local.',
    }),
    defineField({
      name: 'horaires',
      title: 'Horaires d’ouverture',
      type: 'array',
      group: 'horaires',
      of: [
        {
          type: 'object',
          name: 'plage',
          fields: [
            {
              name: 'libelle',
              title: 'Jours',
              type: 'string',
              description: 'Exemple : « Lundi – vendredi ».',
            },
            { name: 'ouverture', title: 'Ouverture', type: 'string', description: 'Format 08:30.' },
            { name: 'fermeture', title: 'Fermeture', type: 'string', description: 'Format 18:30.' },
          ],
          preview: {
            select: { title: 'libelle', o: 'ouverture', f: 'fermeture' },
            prepare: ({ title, o, f }) => ({ title, subtitle: [o, f].filter(Boolean).join(' – ') }),
          },
        },
      ],
    }),
    defineField({
      name: 'reseaux',
      title: 'Liens vers les réseaux sociaux',
      type: 'array',
      group: 'social',
      of: [
        {
          type: 'object',
          name: 'reseau',
          fields: [
            {
              name: 'nom',
              title: 'Réseau',
              type: 'string',
              options: {
                list: ['Facebook', 'Instagram', 'LinkedIn', 'Google', 'Houzz', 'Pinterest'],
              },
            },
            {
              name: 'url',
              title: 'Adresse',
              type: 'url',
              validation: (Rule: any) => Rule.uri({ scheme: ['https'] }),
            },
          ],
          preview: { select: { title: 'nom', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'formeJuridique',
      title: 'Forme juridique',
      type: 'string',
      group: 'legal',
      description: 'Exemple : SARL, SAS, EURL, entreprise individuelle.',
    }),
    defineField({
      name: 'capitalSocial',
      title: 'Capital social',
      type: 'string',
      group: 'legal',
      description: 'Exemple : « 10 000 € ». Laissez vide pour une entreprise individuelle.',
    }),
    defineField({
      name: 'siret',
      title: 'Numéro SIRET',
      type: 'string',
      group: 'legal',
      description: '14 chiffres. Obligatoire dans les mentions légales.',
      validation: (Rule) =>
        Rule.custom((v) =>
          !v || /^\d{14}$/.test(String(v).replace(/\s/g, ''))
            ? true
            : 'Le SIRET comporte 14 chiffres.',
        ),
    }),
    defineField({
      name: 'rcs',
      title: 'RCS',
      type: 'string',
      group: 'legal',
      description: 'Ville d’immatriculation et numéro. Exemple : « RCS Bobigny 123 456 789 ».',
    }),
    defineField({
      name: 'tvaIntracommunautaire',
      title: 'Numéro de TVA intracommunautaire',
      type: 'string',
      group: 'legal',
      description: 'Exemple : FR12345678901.',
    }),
    defineField({
      name: 'directeurPublication',
      title: 'Directeur de la publication',
      type: 'string',
      group: 'legal',
      description: 'La personne responsable du contenu du site. En général le gérant.',
    }),
    defineField({
      name: 'assuranceDecennale',
      title: 'Assureur — garantie décennale',
      type: 'string',
      group: 'legal',
      description: 'Nom de la compagnie d’assurance.',
    }),
    defineField({
      name: 'numeroPoliceDecennale',
      title: 'Numéro de police décennale',
      type: 'string',
      group: 'legal',
      description:
        'Le numéro du contrat. Il doit figurer sur les devis et dans les mentions légales.',
    }),
    defineField({
      name: 'zoneCouverteDecennale',
      title: 'Zone couverte par l’assurance',
      type: 'string',
      group: 'legal',
      description: 'Exemple : « France métropolitaine ».',
    }),
    defineField({
      name: 'anneeCreation',
      title: 'Année de création de l’entreprise',
      type: 'number',
      group: 'preuves',
      description:
        'N’indiquez que l’année réelle figurant sur l’extrait Kbis. Laissée vide, elle n’est affichée nulle part.',
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()).integer(),
    }),
    defineField({
      name: 'nombreChantiers',
      title: 'Nombre de chantiers livrés',
      type: 'number',
      group: 'preuves',
      description:
        'Uniquement si vous pouvez le justifier. En cas de doute, laissez vide : le bloc disparaît.',
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'noteGoogle',
      title: 'Note Google',
      type: 'number',
      group: 'preuves',
      description:
        'Recopiez la note exacte affichée sur votre fiche Google, par exemple 4.8. Ne l’estimez pas.',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'nombreAvisGoogle',
      title: 'Nombre d’avis Google',
      type: 'number',
      group: 'preuves',
      description: 'Le nombre exact affiché sur votre fiche Google, le jour où vous le saisissez.',
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'urlAvisGoogle',
      title: 'Lien vers vos avis Google',
      type: 'url',
      group: 'preuves',
      description: 'Permet au visiteur de vérifier la note lui-même.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'fourchettePrix',
      title: 'Positionnement tarifaire',
      type: 'string',
      group: 'preuves',
      description:
        'Indicateur large transmis à Google, pas un prix. « €€ » signifie milieu de gamme, « €€€ » haut de gamme. Laissez vide si vous préférez ne rien afficher.',
      options: {
        list: [
          { title: '€ — économique', value: '€' },
          { title: '€€ — milieu de gamme', value: '€€' },
          { title: '€€€ — haut de gamme', value: '€€€' },
        ],
        layout: 'radio',
      },
      initialValue: '€€',
    }),
  ],
  preview: { prepare: () => ({ title: 'Réglages du site' }) },
});
