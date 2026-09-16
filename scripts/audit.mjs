/**
 * Contrôle du site généré.
 *
 * Passe en revue chaque page de dist/client et vérifie ce qui, sur l'ancien
 * site, était cassé : titres manquants, métadonnées dupliquées, images sans
 * alternative textuelle, liens morts, traces du prestataire précédent.
 *
 * Usage : node scripts/audit.mjs   (après `npm run build`)
 * Sort en code 1 si une erreur est trouvée, pour servir de garde-fou en CI.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = 'dist/client';
/** Separateur de chemin Windows, sans antislash litteral dans la source. */
const SEPARATEUR = String.fromCharCode(92);
const SITE = 'https://bellcorenovation.com';

/** Chaînes qui ne doivent apparaître nulle part — ancien prestataire, spam. */
const INTERDITS = ['sesrenovation.fr', 'jxx.760.myftpupload.com', 'Agencelec', 'agencelec'];

/** Mots anglais courants qui trahiraient une chaîne non traduite. */
const ANGLAIS = [
  'Read more', 'Learn more', 'Submit', 'Send message', 'Get a quote', 'Our services',
  'Contact us', 'Home page', 'Coming soon', 'Loading', 'Search', 'Previous', 'Next page',
];

const erreurs = [];
const avertissements = [];
const err = (page, msg) => erreurs.push(`${page} — ${msg}`);
const warn = (page, msg) => avertissements.push(`${page} — ${msg}`);

function pagesHtml(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) return pagesHtml(chemin);
    return e.name.endsWith('.html') ? [chemin] : [];
  });
}

const fichiers = pagesHtml(RACINE);
/** Chemins d'URL réellement produits, pour valider les liens internes. */
const urlsConnues = new Set(
  fichiers.map((f) => '/' + relative(RACINE, f).split(SEPARATEUR).join('/').replace(/index\.html$/, '')),
);

const titres = new Map();
/** cible manquante -> pages qui la referencent */
const liensMorts = new Map();
const descriptions = new Map();
let totalImages = 0;
let totalLiensInternes = 0;

for (const fichier of fichiers) {
  const page = '/' + relative(RACINE, fichier).split(SEPARATEUR).join('/').replace(/index\.html$/, '');
  const html = readFileSync(fichier, 'utf8');
  const estStudio = page.startsWith('/studio');

  /* --- Studio ----------------------------------------------------------
     Application tierce : son <head> ne nous appartient pas. On exige
     seulement qu elle ne soit pas indexable. */
  if (estStudio) continue;

  /* --- Langue ---------------------------------------------------------- */
  if (!/<html[^>]*\blang="fr"/.test(html)) err(page, 'lang="fr" absent sur <html>');

  /* --- Titres ---------------------------------------------------------- */
  const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1 !== 1) err(page, `${h1} balise(s) H1 — il en faut exactement une`);

  const niveaux = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let precedent = 0;
  for (const niveau of niveaux) {
    if (precedent && niveau > precedent + 1) {
      warn(page, `saut de niveau H${precedent} vers H${niveau}`);
      break;
    }
    precedent = niveau;
  }

  /* --- Métadonnées ----------------------------------------------------- */
  const titre = (/<title>([^<]*)<\/title>/.exec(html) || [])[1];
  if (!titre) err(page, '<title> absent');
  else {
    if (titre.length > 70) warn(page, `titre de ${titre.length} caractères (> 70)`);
    if (titres.has(titre)) err(page, `titre identique à ${titres.get(titre)} : « ${titre} »`);
    else titres.set(titre, page);
  }

  const desc = (/name="description" content="([^"]*)"/.exec(html) || [])[1];
  if (!desc) err(page, 'meta description absente');
  else {
    if (desc.length > 170) warn(page, `description de ${desc.length} caractères (> 170)`);
    if (desc.length < 50) warn(page, `description de ${desc.length} caractères (< 50)`);
    if (descriptions.has(desc)) err(page, `description identique à ${descriptions.get(desc)}`);
    else descriptions.set(desc, page);
  }

  /* --- Canonique -------------------------------------------------------
     Une page désindexée n'en porte pas : elle désignerait une adresse que
     l'on demande justement aux moteurs d'ignorer. */
  const desindexee = /name="robots"[^>]*noindex/.test(html);
  if (!desindexee) {
    const canon = (/rel="canonical" href="([^"]*)"/.exec(html) || [])[1];
    if (!canon) err(page, 'canonique absente');
    else if (canon !== SITE + page) err(page, `canonique incohérente : ${canon}`);
  } else if (/rel="canonical"/.test(html)) {
    err(page, 'page désindexée mais porteuse d\u2019une canonique');
  }

  /* --- Données structurées --------------------------------------------- */
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      err(page, `JSON-LD invalide : ${e.message}`);
    }
  }

  /* --- Images ---------------------------------------------------------- */
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    totalImages++;
    if (!/\salt=/.test(m[0])) err(page, `<img> sans attribut alt : ${m[0].slice(0, 80)}`);
    if (!/\swidth=/.test(m[0]) || !/\sheight=/.test(m[0])) {
      warn(page, 'image sans width/height — risque de décalage de mise en page');
    }
  }

  /* --- Liens internes --------------------------------------------------- */
  if (!estStudio) {
    for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const cible = m[1];
      if (cible.startsWith('/_astro/') || /\.[a-z0-9]{2,5}$/i.test(cible)) continue;
      totalLiensInternes++;
      if (!urlsConnues.has(cible)) {
        if (!liensMorts.has(cible)) liensMorts.set(cible, new Set());
        liensMorts.get(cible).add(page);
      }
    }
  }

  /* --- Chaînes interdites ---------------------------------------------- */
  for (const interdit of INTERDITS) {
    if (html.includes(interdit)) err(page, `chaîne interdite présente : ${interdit}`);
  }

  /* --- Anglais résiduel ------------------------------------------------- */
  if (!estStudio) {
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
    for (const mot of ANGLAIS) {
      if (visible.includes(mot)) warn(page, `formulation anglaise repérée : « ${mot} »`);
    }
  }

  /* --- JavaScript ------------------------------------------------------- */
  if (!estStudio) {
    const externes = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
    const nonIlot = externes.filter((s) => !s.includes('/_astro/'));
    if (nonIlot.length) err(page, `script externe inattendu : ${nonIlot.join(', ')}`);
  }
}

/* --- Fichiers attendus à la racine -------------------------------------- */
for (const attendu of ['sitemap-index.xml', 'favicon.svg', 'robots.txt']) {
  if (!existsSync(join(RACINE, attendu))) err('(racine)', `fichier absent : ${attendu}`);
}
/* Le Studio ne doit pas être indexable. Son HTML est produit par Sanity : la
   désindexation passe donc par un en-tête HTTP et par robots.txt, et non par
   une balise que nous ne contrôlons pas. */
const cheminHeaders = join(RACINE, '_headers');
if (existsSync(cheminHeaders)) {
  const enTetes = readFileSync(cheminHeaders, 'utf8');
  const bloc = enTetes.split('/studio/*')[1] ?? '';
  const premiereRegle = bloc.split('\n\n')[0] ?? '';
  if (!premiereRegle.includes('X-Robots-Tag') || !premiereRegle.includes('noindex')) {
    err('(racine)', '_headers ne désindexe pas /studio/*');
  }
} else {
  err('(racine)', '_headers absent — le Studio serait indexable');
}

const cheminRobots = join(RACINE, 'robots.txt');
if (existsSync(cheminRobots)) {
  const robots = readFileSync(cheminRobots, 'utf8');
  if (!robots.includes('Disallow: /studio/')) {
    err('(racine)', "robots.txt n'interdit pas /studio/");
  }
}

/* --- Liens morts agreges ------------------------------------------------ */
for (const [cible, pages] of [...liensMorts].sort()) {
  err('(liens)', `${cible} — cible inexistante, referencee par ${pages.size} page(s)`);
}

/* --- Redirections ---------------------------------------------------------
   Les anciennes adresses portent le référencement acquis : une règle oubliée
   se traduit par une page perdue. Les adresses de spam doivent répondre 410
   et non 404, pour être retirées plus vite de l'index. */
const REDIRECTIONS_ATTENDUES = [
  ['/renovation-dappartement', '/services/renovation-appartement/'],
  ['/renovation-de-maison-villa', '/services/renovation-maison-villa/'],
  ['/renovation-de-studio', '/services/renovation-studio/'],
  ['/renovation-de-salle-de-bain', '/services/renovation-salle-de-bain/'],
  ['/renovation-de-cuisine', '/services/renovation-cuisine/'],
  ['/pose-de-carrelage', '/services/pose-carrelage/'],
  ['/vitrification-et-poncage-de-parquet', '/services/parquet/'],
  ['/bellcoelect', '/services/electricite/'],
  ['/travaux-delectricite', '/services/electricite/'],
  ['/realisations', '/realisations/'],
  ['/contact', '/contact/'],
  ['/blog', '/blog/'],
];
const GONE_ATTENDUS = ['/software-beyond-compare', '/valorant-hack', '/fl-studio-crack'];

const cheminRedirections = join(RACINE, '_redirects');
if (!existsSync(cheminRedirections)) {
  err('(racine)', '_redirects absent — toutes les anciennes adresses renverraient 404');
} else {
  const regles = readFileSync(cheminRedirections, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/));

  for (const [source, cible] of REDIRECTIONS_ATTENDUES) {
    const regle = regles.find((r) => r[0] === source);
    if (!regle) err('(redirections)', `règle absente pour ${source}`);
    else if (regle[1] !== cible) {
      err('(redirections)', `${source} pointe vers ${regle[1]} au lieu de ${cible}`);
    } else if (regle[2] !== '301') {
      err('(redirections)', `${source} utilise un code ${regle[2]} au lieu de 301`);
    } else if (!urlsConnues.has(cible)) {
      err('(redirections)', `${source} redirige vers ${cible}, qui n'existe pas`);
    }
  }

  for (const source of GONE_ATTENDUS) {
    const regle = regles.find((r) => r[0] === source);
    if (!regle) err('(redirections)', `page de spam non neutralisée : ${source}`);
    else if (regle[2] !== '410') {
      err('(redirections)', `${source} répond ${regle[2]} au lieu de 410`);
    }
  }
}

/* --- Rapport ------------------------------------------------------------ */
console.log(`Pages analysées      : ${fichiers.length}`);
console.log(`Images vérifiées     : ${totalImages}`);
console.log(`Liens internes suivis: ${totalLiensInternes}`);
console.log(`Titres uniques       : ${titres.size}`);
console.log('');

if (avertissements.length) {
  console.log(`Avertissements (${avertissements.length}) :`);
  for (const a of avertissements) console.log('  ~ ' + a);
  console.log('');
}
if (erreurs.length) {
  console.log(`ERREURS (${erreurs.length}) :`);
  for (const e of erreurs) console.log('  x ' + e);
  process.exit(1);
}
console.log('Aucune erreur.');
