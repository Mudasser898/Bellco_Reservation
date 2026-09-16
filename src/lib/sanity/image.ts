import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';
import type { ImageAvecAlt, ReferenceImage } from './types';

const constructeur = createImageUrlBuilder(sanityClient);

/** Largeurs du srcset. Couvre du mobile 1x au grand écran 2x. */
const LARGEURS = [400, 640, 828, 1080, 1440, 1920, 2560] as const;

export function urlImage(source: ReferenceImage, largeur: number, hauteur?: number): string {
  let url = constructeur
    .image(source)
    .width(largeur)
    // `auto('format')` laisse le CDN Sanity servir AVIF ou WebP selon ce que le
    // navigateur annonce, sans multiplier les balises <source>.
    .auto('format')
    .quality(80)
    .fit('crop');
  if (hauteur) url = url.height(hauteur);
  return url.url();
}

/**
 * Dimensions intrinsèques réelles de l'image.
 *
 * L'identifiant d'asset Sanity encode les dimensions d'origine :
 * `image-<hash>-<largeur>x<hauteur>-<extension>`. Les lire évite d'inventer un
 * ratio et permet de poser des attributs width/height exacts sur le <img>,
 * donc un CLS nul.
 *
 * @returns `null` si la référence est absente ou illisible.
 */
export function dimensionsSource(
  source: ReferenceImage | undefined,
): { readonly largeur: number; readonly hauteur: number; readonly ratio: number } | null {
  const ref = source?.asset?._ref;
  if (!ref) return null;
  const correspondance = /-(\d+)x(\d+)-[a-z]+$/.exec(ref);
  if (!correspondance) return null;
  const largeur = Number(correspondance[1]);
  const hauteur = Number(correspondance[2]);
  if (!largeur || !hauteur) return null;
  return { largeur, hauteur, ratio: largeur / hauteur };
}

/**
 * Construit le srcset d'une image Sanity.
 *
 * On ne génère jamais de variante plus large que l'original : agrandir une
 * photo ne fait qu'alourdir la page sans rien ajouter.
 *
 * @param source L'image.
 * @param ratio  Rapport largeur/hauteur imposé (ex. 4/3). Omis, le recadrage
 *               d'origine est conservé.
 */
export function srcSetImage(source: ReferenceImage, ratio?: number): string {
  const intrinseque = dimensionsSource(source);
  const plafond = intrinseque?.largeur ?? 2560;
  const largeurs = LARGEURS.filter((l) => l <= plafond);
  // Si l'original est plus petit que la plus petite variante, on le sert seul.
  const retenues = largeurs.length > 0 ? largeurs : [plafond];
  return retenues
    .map((l) => `${urlImage(source, l, ratio ? Math.round(l / ratio) : undefined)} ${l}w`)
    .join(', ');
}

/**
 * Texte alternatif d'une image.
 *
 * Le schéma le rend obligatoire ; ce repli ne couvre que les documents créés
 * avant la contrainte. Il renvoie une chaîne vide plutôt qu'un texte inventé :
 * une image sans alt vaut mieux qu'un alt mensonger.
 */
export function altImage(image: ImageAvecAlt | undefined): string {
  return image?.alt?.trim() ?? '';
}

/** Une image est-elle exploitable (fichier réellement déposé) ? */
export function imageValide(image: ImageAvecAlt | undefined): image is ImageAvecAlt {
  return Boolean(image?.asset?._ref);
}
