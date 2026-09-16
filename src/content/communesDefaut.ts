/**
 * Contenu par défaut des pages de commune.
 *
 * Écrit commune par commune, à dessein : Google pénalise les pages locales qui
 * ne sont qu'un même texte avec le nom de la ville remplacé. Chaque page parle
 * donc du bâti réellement présent sur place et des contraintes qu'il impose.
 *
 * Aucune statistique, aucun chiffre de chantier : uniquement des observations
 * de terrain vérifiables.
 */

export type ContenuCommuneDefaut = {
  readonly accroche: string;
  readonly paragraphes: readonly string[];
  /** Particularités locales, affichées en liste. */
  readonly specificites: readonly string[];
};

export const COMMUNES_DEFAUT: Readonly<Record<string, ContenuCommuneDefaut>> = {
  'saint-denis': {
    accroche:
      'Notre atelier est à Saint-Denis, avenue du Président Wilson. C’est la commune où nous intervenons le plus souvent, et celle dont nous connaissons le mieux le bâti.',
    paragraphes: [
      'Saint-Denis juxtapose des époques de construction très différentes : pavillons de brique du début du XXᵉ siècle, grands ensembles des années soixante, immeubles haussmanniens autour du centre ancien, et programmes neufs sur les anciennes emprises industrielles. Chacun appelle une approche distincte — on ne reprend pas l’électricité d’un pavillon de 1930 comme celle d’un appartement livré en 2015.',
      'Être installés sur place change deux choses concrètes : nous passons faire un relevé sans facturer de déplacement, et nous repassons rapidement quand une question se pose en cours de chantier. Sur un imprévu à l’ouverture d’une cloison, cela se compte en heures plutôt qu’en jours.',
    ],
    specificites: [
      'Pavillons de brique : reprise d’isolation et remplacement des menuiseries',
      'Bâti ancien du centre : planchers bois, réseaux à refaire intégralement',
      'Copropriétés récentes : travaux encadrés par le règlement, dossier syndic préparé',
      'Intervention sans frais de déplacement, l’atelier étant dans la commune',
    ],
  },

  aubervilliers: {
    accroche:
      'Aubervilliers est limitrophe de notre atelier. Nous y intervenons régulièrement, sur des logements anciens comme sur des programmes récents.',
    paragraphes: [
      'Le parc d’Aubervilliers comprend beaucoup d’immeubles d’avant-guerre dont les réseaux n’ont jamais été entièrement repris, et où subsistent des canalisations en plomb. C’est un poste que nous vérifions systématiquement au relevé : son remplacement est obligatoire, et mieux vaut le découvrir avant de chiffrer que pendant le chantier.',
      'La commune compte aussi d’anciens locaux d’activité transformés en logements ou en bureaux. Ces volumes offrent de belles possibilités, mais demandent une attention particulière à l’isolation acoustique et au traitement de l’humidité — deux postes que nous chiffrons séparément pour que l’arbitrage soit clair.',
    ],
    specificites: [
      'Immeubles d’avant-guerre : dépose des canalisations en plomb',
      'Anciens locaux d’activité : isolation acoustique et traitement de l’humidité',
      'Copropriétés : préparation du dossier d’autorisation de travaux',
      'Commune limitrophe de notre atelier, intervention rapide',
    ],
  },

  'saint-ouen': {
    accroche:
      'À Saint-Ouen-sur-Seine, nous travaillons aussi bien sur le bâti ancien des Puces que sur les logements livrés dans les nouveaux quartiers.',
    paragraphes: [
      'Le secteur ancien de Saint-Ouen conserve des immeubles de rapport aux volumes généreux, souvent avec des moulures et des parquets d’origine. Quand ils sont récupérables, nous privilégions la remise à neuf plutôt que le remplacement : un parquet massif poncé et vitrifié coûte moins cher qu’un sol neuf et vaut davantage.',
      'Les programmes récents posent des questions inverses : le bâti est sain, mais les finitions de série vieillissent vite et les volumes sont contraints. L’enjeu y est l’optimisation — rangements sur mesure, redistribution légère, reprise des finitions.',
    ],
    specificites: [
      'Bâti ancien : conservation et remise à neuf des parquets et moulures',
      'Programmes récents : optimisation des volumes et rangements sur mesure',
      'Rénovation de locaux commerciaux aux abords des Puces',
      'Interventions planifiées pour limiter la gêne en copropriété',
    ],
  },

  paris: {
    accroche:
      'Nous intervenons dans Paris intra-muros, principalement sur les arrondissements du nord et de l’est, les plus proches de notre atelier.',
    paragraphes: [
      'Un chantier parisien se heurte d’abord à la logistique : stationnement à réserver, accès par cage d’escalier étroite, horaires encadrés par le règlement de copropriété, évacuation des gravats à organiser. Ces contraintes ont un coût réel, et nous les chiffrons explicitement plutôt que de les diluer dans un forfait.',
      'Le bâti haussmannien impose ses propres règles : planchers bois avec solives dont il faut respecter la portée, cloisons en plâtre sur lattis, cheminées et moulures qui font la valeur du bien. Nous travaillons avec ces éléments plutôt que contre eux, et nous le disons quand une redistribution envisagée ferait perdre plus qu’elle n’apporte.',
    ],
    specificites: [
      'Haussmannien : respect des planchers bois, moulures et cheminées',
      'Logistique de chantier parisienne chiffrée en poste distinct',
      'Dossiers de copropriété et réservation de stationnement pris en charge',
      'Intervention principalement sur le nord et l’est de Paris',
    ],
  },
};
