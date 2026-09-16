import { COMMUNES, ENTREPRISE, HORAIRES, SITE_URL } from '~/lib/site';
import type { Reglages } from '~/lib/sanity/types';
import { urlAbsolue } from './meta';

/** Identifiants stables, pour que les entités se référencent entre elles. */
export const ID_ENTREPRISE = `${SITE_URL}/#entreprise`;
export const ID_SITE = `${SITE_URL}/#site`;

type Json = Record<string, unknown>;

/** Retire les clés vides : mieux vaut omettre une propriété que l'affirmer à vide. */
function compact(objet: Json): Json {
  return Object.fromEntries(
    Object.entries(objet).filter(([, v]) => {
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }),
  );
}

/**
 * Fiche d'entreprise locale.
 *
 * Les réglages Sanity font autorité ; les constantes du site servent de repli
 * pour que la fiche reste valide avant la première saisie.
 */
export function schemaLocalBusiness(reglages: Reglages = {}): Json {
  const horaires = (reglages.horaires?.length ? reglages.horaires : null) ?? HORAIRES;

  return compact({
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': ID_ENTREPRISE,
    name: reglages.nomEntreprise ?? ENTREPRISE.nom,
    url: `${SITE_URL}/`,
    telephone: reglages.telephoneInternational ?? ENTREPRISE.telephoneE164,
    email: reglages.email ?? ENTREPRISE.email,
    address: compact({
      '@type': 'PostalAddress',
      streetAddress: reglages.adresseRue ?? ENTREPRISE.adresse.rue,
      postalCode: reglages.adresseCodePostal ?? ENTREPRISE.adresse.codePostal,
      addressLocality: reglages.adresseVille ?? ENTREPRISE.adresse.ville,
      addressCountry: 'FR',
    }),
    geo: reglages.geo
      ? { '@type': 'GeoCoordinates', latitude: reglages.geo.lat, longitude: reglages.geo.lng }
      : undefined,
    openingHoursSpecification: horaires.map((plage) =>
      compact({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'jours' in plage ? plage.jours : undefined,
        opens: plage.ouverture,
        closes: plage.fermeture,
      }),
    ),
    areaServed: [
      ...COMMUNES.map((c) => ({ '@type': 'City', name: c.nom })),
      { '@type': 'AdministrativeArea', name: 'Île-de-France' },
    ],
    // Indicateur de positionnement, saisi dans les réglages. Omis s'il est vide :
    // on n'invente pas de fourchette de prix.
    priceRange: reglages.fourchettePrix,
    foundingDate: reglages.anneeCreation ? String(reglages.anneeCreation) : undefined,
    vatID: reglages.tvaIntracommunautaire,
    sameAs: reglages.reseaux?.map((r) => r.url).filter(Boolean),
  });
}

/** Prestation proposée, rattachée à l'entreprise. */
export function schemaService(params: {
  readonly nom: string;
  readonly description: string;
  readonly chemin: string;
}): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.nom,
    description: params.description,
    serviceType: params.nom,
    url: urlAbsolue(params.chemin),
    provider: { '@id': ID_ENTREPRISE },
    areaServed: [
      ...COMMUNES.map((c) => ({ '@type': 'City', name: c.nom })),
      { '@type': 'AdministrativeArea', name: 'Île-de-France' },
    ],
  });
}

/** Foire aux questions. À n'émettre que si les réponses sont visibles sur la page. */
export function schemaFAQ(
  entrees: readonly { readonly question: string; readonly reponse: string }[],
): Json | null {
  if (entrees.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entrees.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.reponse },
    })),
  };
}

export type ElementFilAriane = { readonly libelle: string; readonly href: string };

/** Fil d'Ariane. L'accueil est ajouté ici, il n'a pas à être répété partout. */
export function schemaFilAriane(elements: readonly ElementFilAriane[]): Json | null {
  if (elements.length === 0) return null;
  const complet: ElementFilAriane[] = [{ libelle: 'Accueil', href: '/' }, ...elements];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: complet.map((element, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: element.libelle,
      item: urlAbsolue(element.href),
    })),
  };
}

/** Article de blog. */
export function schemaArticle(params: {
  readonly titre: string;
  readonly description: string;
  readonly chemin: string;
  readonly datePublication: string;
  readonly auteur?: string | undefined;
  readonly imageUrl?: string | undefined;
}): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.titre,
    description: params.description,
    url: urlAbsolue(params.chemin),
    mainEntityOfPage: urlAbsolue(params.chemin),
    datePublished: params.datePublication,
    image: params.imageUrl,
    author: { '@type': 'Organization', name: params.auteur ?? ENTREPRISE.nom },
    publisher: { '@id': ID_ENTREPRISE },
  });
}

/** Photo de chantier, décrite pour la recherche d'images. */
export function schemaImageObject(params: {
  readonly url: string;
  readonly description: string;
  readonly largeur?: number | undefined;
  readonly hauteur?: number | undefined;
}): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: params.url,
    description: params.description,
    width: params.largeur,
    height: params.hauteur,
    creator: { '@id': ID_ENTREPRISE },
  });
}
