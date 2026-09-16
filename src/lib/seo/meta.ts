import { ENTREPRISE, SITE_URL } from '~/lib/site';

/** Longueurs visées. Au-delà, Google tronque. */
const TITRE_MAX = 60;
const DESCRIPTION_MAX = 160;

export type EntreeMeta = {
  /** Titre éditorial de la page (souvent le H1). */
  readonly titre: string;
  /** Description éditoriale, ou résumé du contenu. */
  readonly description: string;
  /** Titre saisi dans Sanity. Prioritaire s'il existe. */
  readonly metaTitle?: string | undefined;
  /** Description saisie dans Sanity. Prioritaire si elle existe. */
  readonly metaDescription?: string | undefined;
};

export type MetaCalculees = {
  readonly titre: string;
  readonly description: string;
  readonly canonique: string;
};

/**
 * Compose les métadonnées finales d'une page.
 *
 * Priorité : ce que l'éditeur a saisi dans Sanity, sinon une valeur construite
 * à partir du contenu. Aucune page ne se retrouve donc sans titre ni
 * description — c'était le cas de la plupart des pages de l'ancien site.
 *
 * @param entree  Titres et descriptions disponibles.
 * @param chemin  Chemin de la page, barre oblique finale comprise.
 */
export function construireMeta(entree: EntreeMeta, chemin: string): MetaCalculees {
  const suffixe = ` | ${ENTREPRISE.nom}`;

  const titreBrut = entree.metaTitle?.trim() || entree.titre.trim();
  // On n'ajoute le suffixe que s'il tient dans la limite et n'y est pas déjà.
  const titre = titreBrut.includes(ENTREPRISE.nom)
    ? titreBrut
    : titreBrut.length + suffixe.length <= TITRE_MAX
      ? titreBrut + suffixe
      : titreBrut;

  const descriptionBrute = entree.metaDescription?.trim() || entree.description.trim();
  const description = tronquerProprement(descriptionBrute, DESCRIPTION_MAX);

  return {
    titre,
    description,
    canonique: new URL(chemin, SITE_URL).href,
  };
}

/**
 * Tronque sur une frontière de mot et ajoute une ellipse.
 * Couper au milieu d'un mot donne un extrait bancal dans les résultats.
 */
export function tronquerProprement(texte: string, maximum: number): string {
  if (texte.length <= maximum) return texte;
  const coupe = texte.slice(0, maximum - 1);
  const dernierEspace = coupe.lastIndexOf(' ');
  return (dernierEspace > maximum * 0.6 ? coupe.slice(0, dernierEspace) : coupe).trimEnd() + '…';
}

/** Transforme un chemin en URL absolue. */
export function urlAbsolue(chemin: string): string {
  return new URL(chemin, SITE_URL).href;
}
