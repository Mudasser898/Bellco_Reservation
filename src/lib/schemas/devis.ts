import { z } from 'zod';

/**
 * Schéma de la demande de devis — partagé par le formulaire et l'endpoint.
 *
 * C'est la même définition qui valide dans le navigateur et sur le serveur.
 * Un contournement du JavaScript côté client ne fait donc gagner aucune
 * latitude : la requête est revalidée à l'arrivée, avec les mêmes règles et
 * les mêmes messages.
 *
 * Tous les messages sont rédigés en français, à la deuxième personne du
 * pluriel, et disent quoi faire plutôt que ce qui ne va pas.
 */

export const TYPES_DE_BIEN = ['appartement', 'maison', 'studio', 'local-commercial'] as const;

export const POSTES_TRAVAUX = [
  'renovation-complete',
  'salle-de-bain',
  'cuisine',
  'carrelage',
  'parquet',
  'electricite',
  'plomberie',
  'peinture',
  'menuiserie',
] as const;

export const BUDGETS = [
  'moins-15k',
  '15-30k',
  '30-60k',
  '60-100k',
  '100-150k',
  'plus-150k',
  'je-ne-sais-pas',
] as const;

export const DELAIS = ['des-que-possible', '1-3-mois', '3-6-mois', 'plus-tard'] as const;

/** Libellés affichés. Les valeurs ci-dessus ne sortent jamais à l'écran. */
export const LIBELLES = {
  typeDeBien: {
    appartement: 'Appartement',
    maison: 'Maison ou villa',
    studio: 'Studio',
    'local-commercial': 'Local commercial',
  },
  travaux: {
    'renovation-complete': 'Rénovation complète',
    'salle-de-bain': 'Salle de bain',
    cuisine: 'Cuisine',
    carrelage: 'Carrelage',
    parquet: 'Parquet',
    electricite: 'Électricité',
    plomberie: 'Plomberie',
    peinture: 'Peinture',
    menuiserie: 'Menuiserie',
  },
  budget: {
    'moins-15k': 'Moins de 15 000 €',
    '15-30k': '15 000 à 30 000 €',
    '30-60k': '30 000 à 60 000 €',
    '60-100k': '60 000 à 100 000 €',
    '100-150k': '100 000 à 150 000 €',
    'plus-150k': 'Plus de 150 000 €',
    'je-ne-sais-pas': 'Je ne sais pas encore',
  },
  delai: {
    'des-que-possible': 'Dès que possible',
    '1-3-mois': 'Dans 1 à 3 mois',
    '3-6-mois': 'Dans 3 à 6 mois',
    'plus-tard': 'Plus tard, je me renseigne',
  },
} as const;

/** Téléphone français : 10 chiffres, ou format international +33. */
const TELEPHONE = /^(?:(?:\+|00)33[\s.-]?[1-9]|0[1-9])(?:[\s.-]?\d{2}){4}$/;

export const schemaDevis = z.object({
  typeDeBien: z.enum(TYPES_DE_BIEN, {
    error: 'Indiquez le type de bien à rénover.',
  }),

  surface: z
    .number({ error: 'Indiquez la surface concernée, en mètres carrés.' })
    .int({ error: 'Indiquez un nombre entier de mètres carrés.' })
    .min(1, { error: 'La surface doit être d’au moins 1 m².' })
    .max(2000, { error: 'Au-delà de 2 000 m², contactez-nous directement par téléphone.' }),

  travaux: z
    .array(z.enum(POSTES_TRAVAUX), { error: 'Sélectionnez au moins un poste de travaux.' })
    .min(1, { error: 'Sélectionnez au moins un poste de travaux.' }),

  budget: z.enum(BUDGETS, { error: 'Indiquez une enveloppe, même approximative.' }),

  delai: z.enum(DELAIS, { error: 'Indiquez quand vous souhaitez démarrer.' }),

  nom: z
    .string({ error: 'Indiquez votre nom.' })
    .trim()
    .min(2, { error: 'Indiquez votre nom (2 caractères minimum).' })
    .max(80, { error: 'Ce nom dépasse 80 caractères.' }),

  email: z
    .email({ error: 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.' })
    .max(150, { error: 'Cette adresse dépasse 150 caractères.' }),

  telephone: z
    .string({ error: 'Indiquez un numéro de téléphone.' })
    .trim()
    .regex(TELEPHONE, {
      error: 'Indiquez un numéro français valide, par exemple 06 12 34 56 78.',
    }),

  codePostal: z
    .string({ error: 'Indiquez le code postal du chantier.' })
    .trim()
    .regex(/^\d{5}$/, { error: 'Le code postal comporte cinq chiffres.' }),

  message: z
    .string({ error: 'Le message doit être du texte.' })
    .trim()
    .max(2000, { error: 'Votre message dépasse 2 000 caractères.' })
    .optional(),

  /* Consentement RGPD : le refus doit bloquer l'envoi, d'où `literal(true)`. */
  consentement: z.literal(true, {
    error: 'Vous devez accepter que vos données soient utilisées pour vous répondre.',
  }),

  /* Jeton Turnstile, vérifié côté serveur uniquement. */
  turnstileToken: z.string().min(1, { error: 'Validation anti-robot manquante.' }).optional(),
});

export type DonneesDevis = z.infer<typeof schemaDevis>;

/** Champs regroupés par étape, dans l'ordre du formulaire. */
export const ETAPES = [
  { cle: 'typeDeBien', titre: 'Quel type de bien souhaitez-vous rénover ?', champs: ['typeDeBien'] },
  { cle: 'surface', titre: 'Quelle surface est concernée ?', champs: ['surface'] },
  { cle: 'travaux', titre: 'Quels travaux envisagez-vous ?', champs: ['travaux'] },
  { cle: 'budget', titre: 'Quelle enveloppe avez-vous en tête ?', champs: ['budget'] },
  { cle: 'delai', titre: 'Quand souhaitez-vous démarrer ?', champs: ['delai'] },
  {
    cle: 'coordonnees',
    titre: 'Comment vous recontacter ?',
    champs: ['nom', 'email', 'telephone', 'codePostal', 'message', 'consentement'],
  },
] as const;

/** Libellés courts du fil de progression. */
export const LIBELLES_ETAPES = [
  'Type de bien',
  'Surface',
  'Travaux',
  'Budget',
  'Délai',
  'Coordonnées',
] as const;

/**
 * Valide une étape isolément.
 *
 * On ne peut pas appliquer le schéma entier : les étapes suivantes ne sont pas
 * encore renseignées et produiraient des erreurs sans rapport. On ne retient
 * donc que les problèmes portant sur les champs de l'étape courante.
 *
 * @returns Un objet champ → message, vide si l'étape est valide.
 */
export function validerEtape(
  indexEtape: number,
  valeurs: Record<string, unknown>,
): Record<string, string> {
  const etape = ETAPES[indexEtape];
  if (!etape) return {};

  const resultat = schemaDevis.safeParse(valeurs);
  if (resultat.success) return {};

  const champsEtape = new Set<string>(etape.champs);
  const erreurs: Record<string, string> = {};
  for (const probleme of resultat.error.issues) {
    const champ = String(probleme.path[0] ?? '');
    if (champsEtape.has(champ) && !erreurs[champ]) {
      erreurs[champ] = probleme.message;
    }
  }
  return erreurs;
}
