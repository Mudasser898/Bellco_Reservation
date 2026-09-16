/**
 * Constantes du site — coordonnées, navigation, liens d’action.
 *
 * Ces valeurs sont le repli statique : elles servent au build et aux pages
 * qui ne requêtent pas Sanity. Les mêmes champs existent dans le document
 * `settings` du Studio ; quand il est renseigné, il fait autorité.
 */

export const SITE_URL = 'https://bellcorenovation.com' as const;
export const LOCALE = 'fr-FR' as const;
export const LANG = 'fr' as const;

/** Nom, adresse, téléphone — la triade « NAP » que le référencement local exige
 *  d’écrire strictement à l’identique partout (site, Google, annuaires). */
export const ENTREPRISE = {
  nom: 'Bellco Rénovation',
  gerant: 'M. Assim',
  adresse: {
    rue: '235 avenue du Président Wilson',
    codePostal: '93210',
    ville: 'Saint-Denis',
    pays: 'FR',
  },
  /** Affichage à la française, tel que le client le lit. */
  telephoneAffiche: '07 66 25 14 36',
  /** Format E.164 pour href="tel:" et pour le JSON-LD. */
  telephoneE164: '+33766251436',
  email: 'contact@bellcorenovation.com',
} as const;

/** Horaires d’ouverture. `jours` utilise les codes schema.org, réutilisés tels
 *  quels dans openingHoursSpecification. */
export const HORAIRES = [
  {
    libelle: 'Lundi – vendredi',
    jours: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ouverture: '08:30',
    fermeture: '18:30',
  },
  {
    libelle: 'Samedi',
    jours: ['Saturday'],
    ouverture: '09:00',
    fermeture: '18:00',
  },
] as const;

export const JOUR_FERME = 'Dimanche — fermé' as const;

/* -------------------------------------------------------------------------- */
/*  Liens d’action                                                            */
/* -------------------------------------------------------------------------- */

export const TEL_HREF = `tel:${ENTREPRISE.telephoneE164}` as const;
export const EMAIL_HREF = `mailto:${ENTREPRISE.email}` as const;

/**
 * Lien WhatsApp avec message pré-rempli.
 *
 * Le message est en français et se suffit à lui-même : aucun crochet, aucun
 * jeton à remplacer. L’ancien site envoyait un texte anglais contenant un
 * « [renovation] » littéral — c’est précisément ce qu’il faut éviter.
 */
const WHATSAPP_NUMERO = '33766251436' as const;
const WHATSAPP_MESSAGE =
  'Bonjour, je souhaite obtenir un devis pour des travaux de rénovation. Pouvez-vous me recontacter ?';

/**
 * @param contexte Précision facultative ajoutée au message, par exemple
 *   « une salle de bain » ou « un appartement à Saint-Denis ». Toujours du
 *   texte français complet — jamais un identifiant technique.
 */
export function lienWhatsApp(contexte?: string): string {
  const message = contexte
    ? `Bonjour, je souhaite obtenir un devis pour ${contexte}. Pouvez-vous me recontacter ?`
    : WHATSAPP_MESSAGE;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(message)}`;
}

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export type Service = {
  readonly slug: string;
  readonly titre: string;
  /** Une ligne, affichée sous le titre dans le méga-menu et les cartes. */
  readonly accroche: string;
  /**
   * Groupe nominal avec son article, à glisser dans une phrase.
   * Le titre ne peut pas servir à cela : « un projet de électricité » ou
   * « un devis pour parquet : pose, ponçage » ne sont pas du français.
   */
  readonly syntagme: string;
};

/** Ordre d’affichage volontaire : les prestations les plus demandées d’abord. */
export const SERVICES: readonly Service[] = [
  {
    slug: 'renovation-appartement',
    titre: "Rénovation d’appartement",
    accroche: 'Complète ou partielle, en site occupé comme vide',
    syntagme: 'une rénovation d’appartement',
  },
  {
    slug: 'renovation-maison-villa',
    titre: 'Rénovation de maison et villa',
    accroche: 'Redistribution, extension, rénovation énergétique',
    syntagme: 'une rénovation de maison',
  },
  {
    slug: 'renovation-studio',
    titre: 'Rénovation de studio',
    accroche: 'Optimisation des volumes et rangements sur mesure',
    syntagme: 'une rénovation de studio',
  },
  {
    slug: 'renovation-salle-de-bain',
    titre: 'Rénovation de salle de bain',
    accroche: "Douche à l’italienne, adaptation PMR, plomberie neuve",
    syntagme: 'une rénovation de salle de bain',
  },
  {
    slug: 'renovation-cuisine',
    titre: 'Rénovation de cuisine',
    accroche: 'Ouverture sur le séjour, réseaux, pose et finitions',
    syntagme: 'une rénovation de cuisine',
  },
  {
    slug: 'pose-carrelage',
    titre: 'Pose de carrelage',
    accroche: 'Sols et murs, grands formats, chape et ragréage',
    syntagme: 'une pose de carrelage',
  },
  {
    slug: 'parquet',
    titre: 'Parquet : pose, ponçage, vitrification',
    accroche: 'Massif, contrecollé, remise à neuf de parquets anciens',
    syntagme: 'des travaux de parquet',
  },
  {
    slug: 'electricite',
    titre: 'Électricité',
    accroche: 'Mise aux normes NF C 15-100, tableau, réseaux',
    syntagme: 'des travaux d’électricité',
  },
  {
    slug: 'peinture',
    titre: 'Peinture',
    accroche: 'Préparation des supports, enduits, finitions soignées',
    syntagme: 'des travaux de peinture',
  },
  {
    slug: 'plomberie',
    titre: 'Plomberie',
    accroche: 'Alimentation, évacuation, sanitaires, chauffe-eau',
    syntagme: 'des travaux de plomberie',
  },
] as const;

export type Commune = {
  readonly slug: string;
  readonly nom: string;
  readonly codePostal: string;
};

export const COMMUNES: readonly Commune[] = [
  { slug: 'saint-denis', nom: 'Saint-Denis', codePostal: '93200' },
  { slug: 'aubervilliers', nom: 'Aubervilliers', codePostal: '93300' },
  { slug: 'saint-ouen', nom: 'Saint-Ouen-sur-Seine', codePostal: '93400' },
  { slug: 'paris', nom: 'Paris', codePostal: '75000' },
] as const;

export type LienNav = { readonly href: string; readonly libelle: string };

/** Navigation principale. « Services » est traité à part : il ouvre le méga-menu. */
export const NAV_PRINCIPALE: readonly LienNav[] = [
  { href: '/realisations/', libelle: 'Réalisations' },
  { href: '/zones-intervention/', libelle: "Zones d’intervention" },
  { href: '/a-propos/', libelle: 'À propos' },
  { href: '/blog/', libelle: 'Blog' },
  { href: '/contact/', libelle: 'Contact' },
] as const;

export const NAV_PIED: readonly LienNav[] = [
  { href: '/mentions-legales/', libelle: 'Mentions légales' },
  { href: '/politique-de-confidentialite/', libelle: 'Politique de confidentialité' },
] as const;

/** Libellés lisibles des types de bien, tels qu'ils s'affichent sur le site. */
export const TYPES_DE_BIEN = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  'local-commercial': 'Local commercial',
} as const satisfies Record<string, string>;
