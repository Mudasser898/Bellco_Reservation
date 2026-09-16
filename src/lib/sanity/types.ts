/**
 * Formes renvoyées par les requêtes GROQ de `queries.ts`.
 *
 * Elles décrivent la projection, pas le document brut : ce qui est déclaré ici
 * est exactement ce que la requête demande.
 */

export type ReferenceImage = {
  readonly _type: 'image';
  readonly asset?: { readonly _ref: string; readonly _type: 'reference' };
  readonly hotspot?: { readonly x: number; readonly y: number };
  readonly crop?: {
    readonly top: number;
    readonly bottom: number;
    readonly left: number;
    readonly right: number;
  };
};

export type ImageAvecAlt = ReferenceImage & {
  readonly alt?: string;
  readonly legende?: string;
};

/** Bloc de texte riche. Le rendu est fait au build, jamais côté client. */
export type BlocContenu = readonly unknown[];

export type QuestionReponse = {
  readonly question: string;
  readonly reponse: string;
};

export type CitationClient = {
  readonly texte?: string;
  readonly nom?: string;
  readonly commune?: string;
};

export type ServiceResume = {
  readonly _id: string;
  readonly titre: string;
  readonly slug: string;
  readonly resume: string;
  readonly heroImage?: ImageAvecAlt;
  readonly ordre?: number;
};

export type Service = ServiceResume & {
  readonly contenu?: BlocContenu;
  readonly prestations?: readonly string[];
  readonly faq?: readonly QuestionReponse[];
  readonly galerie?: readonly ImageAvecAlt[];
  readonly metaTitle?: string;
  readonly metaDescription?: string;
};

export type TypeDeBien = 'appartement' | 'maison' | 'studio' | 'local-commercial';

export type CommuneResume = {
  readonly _id: string;
  readonly nom: string;
  readonly slug: string;
  readonly codePostal: string;
};

export type Commune = CommuneResume & {
  readonly description?: BlocContenu;
  readonly metaTitle?: string;
  readonly metaDescription?: string;
};

export type ProjetResume = {
  readonly _id: string;
  readonly titre: string;
  readonly slug: string;
  readonly typeDeBien: TypeDeBien;
  readonly commune?: CommuneResume;
  readonly surface?: number;
  readonly duree?: string;
  readonly imageApres?: ImageAvecAlt;
  readonly featured?: boolean;
  readonly ordre?: number;
  /** Slugs des services rattachés — utilisés pour filtrer le portfolio. */
  readonly corpsDeMetierSlugs?: readonly string[];
};

export type Projet = ProjetResume & {
  readonly budgetRange?: string;
  readonly description?: BlocContenu;
  readonly imageAvant?: ImageAvecAlt;
  readonly galerie?: readonly ImageAvecAlt[];
  readonly citationClient?: CitationClient;
  readonly corpsDeMetier?: readonly ServiceResume[];
  readonly servicesLies?: readonly ServiceResume[];
  readonly metaTitle?: string;
  readonly metaDescription?: string;
};

export type ArticleResume = {
  readonly _id: string;
  readonly titre: string;
  readonly slug: string;
  readonly extrait: string;
  readonly image?: ImageAvecAlt;
  readonly datePublication: string;
  readonly auteur?: string;
  readonly categorie?: string;
};

export type Article = ArticleResume & {
  readonly contenu?: BlocContenu;
  readonly metaTitle?: string;
  readonly metaDescription?: string;
};

export type Temoignage = {
  readonly _id: string;
  readonly nom: string;
  readonly commune?: string;
  readonly texte: string;
  readonly note: number;
  readonly typeDeProjet?: string;
  readonly date?: string;
};

export type PlageHoraire = {
  readonly libelle?: string;
  readonly ouverture?: string;
  readonly fermeture?: string;
};

export type Reglages = {
  readonly nomEntreprise?: string;
  readonly telephone?: string;
  readonly telephoneInternational?: string;
  readonly email?: string;
  readonly adresseRue?: string;
  readonly adresseCodePostal?: string;
  readonly adresseVille?: string;
  readonly geo?: { readonly lat: number; readonly lng: number };
  readonly horaires?: readonly PlageHoraire[];
  readonly reseaux?: readonly { readonly nom?: string; readonly url?: string }[];
  readonly formeJuridique?: string;
  readonly capitalSocial?: string;
  readonly siret?: string;
  readonly rcs?: string;
  readonly tvaIntracommunautaire?: string;
  readonly directeurPublication?: string;
  readonly assuranceDecennale?: string;
  readonly numeroPoliceDecennale?: string;
  readonly zoneCouverteDecennale?: string;
  readonly anneeCreation?: number;
  readonly nombreChantiers?: number;
  readonly noteGoogle?: number;
  readonly nombreAvisGoogle?: number;
  readonly urlAvisGoogle?: string;
  readonly fourchettePrix?: string;
};
