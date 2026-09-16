import { requeteSanity } from './client';
import type {
  Article,
  ArticleResume,
  Commune,
  CommuneResume,
  Projet,
  ProjetResume,
  Reglages,
  Service,
  ServiceResume,
  Temoignage,
} from './types';

/* -------------------------------------------------------------------------- */
/*  Fragments réutilisés                                                      */
/* -------------------------------------------------------------------------- */

/** Une image et son texte alternatif. */
const IMAGE = `{ _type, asset, hotspot, crop, alt, legende }`;

const SERVICE_RESUME = `{
  _id, titre, "slug": slug.current, resume, ordre, heroImage ${IMAGE}
}`;

const COMMUNE_RESUME = `{ _id, nom, "slug": slug.current, codePostal }`;

const PROJET_RESUME = `{
  _id, titre, "slug": slug.current, typeDeBien, surface, duree, featured, ordre,
  imageApres ${IMAGE},
  commune-> ${COMMUNE_RESUME},
  "corpsDeMetierSlugs": corpsDeMetier[]->slug.current
}`;

const ARTICLE_RESUME = `{
  _id, titre, "slug": slug.current, extrait, datePublication, auteur, categorie,
  image ${IMAGE}
}`;

/* -------------------------------------------------------------------------- */
/*  Services                                                                  */
/* -------------------------------------------------------------------------- */

export const tousLesServices = () =>
  requeteSanity<ServiceResume[]>(
    `*[_type == "service"] | order(ordre asc, titre asc) ${SERVICE_RESUME}`,
    {},
    [],
  );

export const serviceParSlug = (slug: string) =>
  requeteSanity<Service | null>(
    `*[_type == "service" && slug.current == $slug][0]{
      _id, titre, "slug": slug.current, resume, ordre, contenu, prestations,
      metaTitle, metaDescription,
      heroImage ${IMAGE},
      galerie[] ${IMAGE},
      faq[]{ question, reponse }
    }`,
    { slug },
    null,
  );

/* -------------------------------------------------------------------------- */
/*  Réalisations                                                              */
/* -------------------------------------------------------------------------- */

export const toutesLesRealisations = () =>
  requeteSanity<ProjetResume[]>(
    `*[_type == "project"] | order(ordre asc, titre asc) ${PROJET_RESUME}`,
    {},
    [],
  );

export const realisationsMisesEnAvant = (limite = 3) =>
  requeteSanity<ProjetResume[]>(
    `*[_type == "project" && featured == true] | order(ordre asc)[0...$limite] ${PROJET_RESUME}`,
    { limite },
    [],
  );

export const realisationParSlug = (slug: string) =>
  requeteSanity<Projet | null>(
    `*[_type == "project" && slug.current == $slug][0]{
      _id, titre, "slug": slug.current, typeDeBien, surface, duree, budgetRange,
      featured, ordre, description, metaTitle, metaDescription,
      imageAvant ${IMAGE},
      imageApres ${IMAGE},
      galerie[] ${IMAGE},
      commune-> ${COMMUNE_RESUME},
      citationClient{ texte, nom, commune },
      corpsDeMetier[]-> ${SERVICE_RESUME},
      servicesLies[]-> ${SERVICE_RESUME},
      "corpsDeMetierSlugs": corpsDeMetier[]->slug.current
    }`,
    { slug },
    null,
  );

/**
 * Réalisations d'une commune.
 *
 * La sélection manuelle de la fiche commune prime ; sans elle, on retombe sur
 * tous les chantiers rattachés à cette commune.
 */
export const realisationsParCommune = (slugCommune: string) =>
  requeteSanity<ProjetResume[]>(
    `coalesce(
       *[_type == "commune" && slug.current == $slugCommune][0].projetsAssocies[]-> ${PROJET_RESUME},
       *[_type == "project" && commune->slug.current == $slugCommune] | order(ordre asc) ${PROJET_RESUME}
     )`,
    { slugCommune },
    [],
  );

/* -------------------------------------------------------------------------- */
/*  Communes                                                                  */
/* -------------------------------------------------------------------------- */

export const toutesLesCommunes = () =>
  requeteSanity<CommuneResume[]>(
    `*[_type == "commune"] | order(nom asc) ${COMMUNE_RESUME}`,
    {},
    [],
  );

export const communeParSlug = (slug: string) =>
  requeteSanity<Commune | null>(
    `*[_type == "commune" && slug.current == $slug][0]{
      _id, nom, "slug": slug.current, codePostal, description, metaTitle, metaDescription
    }`,
    { slug },
    null,
  );

/* -------------------------------------------------------------------------- */
/*  Blog                                                                      */
/* -------------------------------------------------------------------------- */

export const tousLesArticles = () =>
  requeteSanity<ArticleResume[]>(
    `*[_type == "post" && defined(datePublication) && datePublication <= now()]
       | order(datePublication desc) ${ARTICLE_RESUME}`,
    {},
    [],
  );

export const articleParSlug = (slug: string) =>
  requeteSanity<Article | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      _id, titre, "slug": slug.current, extrait, datePublication, auteur, categorie,
      contenu, metaTitle, metaDescription,
      image ${IMAGE}
    }`,
    { slug },
    null,
  );

/* -------------------------------------------------------------------------- */
/*  Témoignages et réglages                                                   */
/* -------------------------------------------------------------------------- */

export const tousLesTemoignages = (limite = 12) =>
  requeteSanity<Temoignage[]>(
    `*[_type == "temoignage"] | order(date desc)[0...$limite]{
      _id, nom, commune, texte, note, typeDeProjet, date
    }`,
    { limite },
    [],
  );

/**
 * Réglages du site. Renvoie un objet vide plutôt que `null` : les gabarits
 * peuvent ainsi lire les champs sans garde partout, et n'affichent rien quand
 * la valeur est absente.
 */
export const reglages = () =>
  requeteSanity<Reglages>(`*[_type == "settings"][0]`, {}, {} as Reglages);
