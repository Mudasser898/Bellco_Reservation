/**
 * Contrôle du schéma de demande de devis.
 *
 * Le même schéma valide dans le navigateur et sur le serveur : une régression
 * ici ouvrirait une faille côté endpoint autant qu'une gêne côté formulaire.
 *
 * Usage : node scripts/test-schema.mjs
 */
import { schemaDevis, validerEtape } from '../src/lib/schemas/devis.ts';

const complet = {
  typeDeBien: 'appartement',
  surface: 72,
  travaux: ['salle-de-bain', 'peinture'],
  budget: '30-60k',
  delai: '1-3-mois',
  nom: 'Nadia B.',
  email: 'nadia@exemple.fr',
  telephone: '06 12 34 56 78',
  codePostal: '93210',
  consentement: true,
};

const sans = (champ) => {
  const copie = { ...complet };
  delete copie[champ];
  return copie;
};

/** [description, données, doit être accepté] */
const cas = [
  ['dossier complet', complet, true],
  ['message facultatif présent', { ...complet, message: 'Cuisine à ouvrir.' }, true],
  ['téléphone espacé', { ...complet, telephone: '06 12 34 56 78' }, true],
  ['téléphone international', { ...complet, telephone: '+33 6 12 34 56 78' }, true],
  ['téléphone collé', { ...complet, telephone: '0612345678' }, true],
  ['téléphone pointé', { ...complet, telephone: '06.12.34.56.78' }, true],
  ['téléphone trop court', { ...complet, telephone: '0612345' }, false],
  ['téléphone alphabétique', { ...complet, telephone: 'abcdefghij' }, false],
  ['téléphone absent', sans('telephone'), false],
  ['code postal à quatre chiffres', { ...complet, codePostal: '9321' }, false],
  ['code postal alphabétique', { ...complet, codePostal: 'ABCDE' }, false],
  ['surface nulle', { ...complet, surface: 0 }, false],
  ['surface négative', { ...complet, surface: -10 }, false],
  ['surface décimale', { ...complet, surface: 72.5 }, false],
  ['surface hors limite', { ...complet, surface: 3000 }, false],
  ['aucun poste de travaux', { ...complet, travaux: [] }, false],
  ['poste de travaux inconnu', { ...complet, travaux: ['toiture'] }, false],
  ['consentement refusé', { ...complet, consentement: false }, false],
  ['consentement absent', sans('consentement'), false],
  ['adresse sans arobase', { ...complet, email: 'nadia.exemple.fr' }, false],
  ['type de bien inconnu', { ...complet, typeDeBien: 'chateau' }, false],
  ['budget inconnu', { ...complet, budget: 'illimite' }, false],
  ['nom trop court', { ...complet, nom: 'N' }, false],
  ['message trop long', { ...complet, message: 'x'.repeat(2001) }, false],
];

let echecs = 0;
for (const [nom, donnees, attendu] of cas) {
  const obtenu = schemaDevis.safeParse(donnees).success;
  if (obtenu !== attendu) {
    echecs++;
    console.log(`  x ${nom} — attendu ${attendu ? 'accepté' : 'rejeté'}, obtenu ${obtenu ? 'accepté' : 'rejeté'}`);
  }
}

/* La validation par étape ne doit signaler que les champs de l'étape. */
const etape0 = validerEtape(0, {});
if (Object.keys(etape0).join() !== 'typeDeBien') {
  echecs++;
  console.log(`  x étape 0 devrait ne signaler que typeDeBien, a signalé : ${Object.keys(etape0).join(', ')}`);
}
if (Object.keys(validerEtape(0, { typeDeBien: 'maison' })).length !== 0) {
  echecs++;
  console.log('  x étape 0 renseignée devrait être sans erreur');
}
const etape5 = Object.keys(validerEtape(5, {}));
for (const attendu of ['nom', 'email', 'telephone', 'codePostal', 'consentement']) {
  if (!etape5.includes(attendu)) {
    echecs++;
    console.log(`  x étape 5 devrait signaler ${attendu}`);
  }
}
if (etape5.includes('surface')) {
  echecs++;
  console.log('  x étape 5 ne doit pas signaler un champ des étapes précédentes');
}

console.log(`Schéma de devis : ${cas.length} cas + validation par étape`);
if (echecs) {
  console.log(`${echecs} échec(s)`);
  process.exit(1);
}
console.log('Tout passe.');

/* --- Aucun message par défaut de Zod ne doit remonter -----------------------
   Les messages par défaut sont en anglais. Une contrainte non annotée les
   laisse passer jusqu'à l'utilisateur : ce contrôle balaie chaque champ avec
   une valeur absente, d'un type erroné, puis nulle. */
const MOTS_ANGLAIS =
  /Invalid|expected|received|required|Required|must be|String|Number|Array|Too small|Too big|input/;

const casLangue = [];
for (const champ of Object.keys(complet)) {
  casLangue.push([`champ absent : ${champ}`, sans(champ)]);
  casLangue.push([`type erroné : ${champ}`, { ...complet, [champ]: { objet: 1 } }]);
  casLangue.push([`valeur nulle : ${champ}`, { ...complet, [champ]: null }]);
}
casLangue.push(['message d’un type erroné', { ...complet, message: 42 }]);

let fuites = 0;
for (const [nom, donnees] of casLangue) {
  const r = schemaDevis.safeParse(donnees);
  if (r.success) continue;
  for (const probleme of r.error.issues) {
    if (MOTS_ANGLAIS.test(probleme.message)) {
      fuites++;
      console.log(`  x ${nom} → message en anglais : « ${probleme.message} »`);
    }
  }
}

console.log(`Langue des messages : ${casLangue.length} cas`);
if (fuites) {
  console.log(`${fuites} message(s) en anglais`);
  process.exit(1);
}
console.log('Tous les messages sont en français.');
