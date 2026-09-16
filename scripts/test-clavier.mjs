/**
 * Parcours clavier, sur la construction de production.
 *
 * Playwright pilote un vrai Chromium : les touches sont de véritables
 * événements clavier, et le document a réellement le focus — ce que le
 * panneau d'aperçu intégré ne garantit pas.
 *
 * Usage : node scripts/test-clavier.mjs [url]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const echecs = [];
const ko = (msg) => echecs.push(msg);

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 } });
const page = await contexte.newPage();

/** Décrit l'élément qui a le focus, et son indicateur visuel. */
const focusActuel = () =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      texte: (el.getAttribute('aria-label') || el.textContent || el.tagName)
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 42),
      balise: el.tagName,
      outline: `${s.outlineStyle} ${s.outlineWidth}`,
      focusVisible: el.matches(':focus-visible'),
      surEcran: r.width > 0 && r.height > 0,
    };
  });

console.log('PARCOURS CLAVIER\n');

/* --- 1. Ordre de tabulation et indicateur de focus ---------------------- */
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.setItem('bellco-consentement', 'refuse'));
await page.reload({ waitUntil: 'networkidle' });

console.log('1. Ordre de tabulation en tête de page');
const arrets = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('Tab');
  const f = await focusActuel();
  if (!f) {
    ko(`tabulation ${i + 1} : aucun élément focalisé`);
    continue;
  }
  arrets.push(f);
  const indicateur = f.outline.startsWith('none') ? 'AUCUN INDICATEUR' : f.outline;
  console.log(`   ${String(i + 1).padStart(2)}. ${f.texte.padEnd(44)} ${indicateur}`);
  if (f.outline.startsWith('none')) ko(`« ${f.texte} » n'a pas d'indicateur de focus`);
  if (!f.surEcran) ko(`« ${f.texte} » reçoit le focus mais n'est pas visible`);
}

/* Le lien d'évitement doit être le premier, et devenir visible. */
if (!arrets[0]?.texte.includes('Aller au contenu')) {
  ko(`le premier arrêt devrait être le lien d'évitement, c'est « ${arrets[0]?.texte} »`);
}

/* --- 2. Méga-menu au clavier -------------------------------------------- */
console.log('\n2. Méga-menu');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
const surServices = await focusActuel();
console.log(`   focus sur : ${surServices?.texte}`);

const megaOuvert = await page.evaluate(async () => {
  await new Promise((r) => setTimeout(r, 400));
  return getComputedStyle(document.querySelector('.mega')).visibility;
});
console.log(`   panneau après focus : ${megaOuvert}`);
if (megaOuvert !== 'visible') ko('le méga-menu ne s\u2019ouvre pas au focus clavier');

await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
const dansPanneau = await page.evaluate(() =>
  document.querySelector('.mega').contains(document.activeElement),
);
console.log(`   la tabulation entre dans le panneau : ${dansPanneau ? 'oui' : 'NON'}`);
if (!dansPanneau) ko('impossible de tabuler dans le méga-menu');

await page.keyboard.press('Escape');
const apresEchap = await page.evaluate(async () => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    visibilite: getComputedStyle(document.querySelector('.mega')).visibility,
    surDeclencheur: document.activeElement === document.querySelector('.nav-services a'),
  };
});
console.log(`   Échap referme : ${apresEchap.visibilite === 'hidden' ? 'oui' : 'NON'}`);
console.log(`   Échap rend le focus au déclencheur : ${apresEchap.surDeclencheur ? 'oui' : 'NON'}`);
if (apresEchap.visibilite !== 'hidden') ko('Échap ne referme pas le méga-menu');
if (!apresEchap.surDeclencheur) ko('Échap ne rend pas le focus au déclencheur');

/* --- 3. Accordéon FAQ ---------------------------------------------------- */
console.log('\n3. Accordéon FAQ');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const premierResume = page.locator('summary').first();
await premierResume.focus();
const ouvertAvant = await page.evaluate(() => document.querySelector('details').open);
await page.keyboard.press('Enter');
const ouvertApres = await page.evaluate(() => document.querySelector('details').open);
console.log(`   Entrée bascule : ${ouvertAvant} → ${ouvertApres}`);
if (ouvertAvant === ouvertApres) ko('la touche Entrée n\u2019ouvre pas la FAQ');

await navigateur.close();

console.log('\n' + '-'.repeat(60));
if (echecs.length) {
  console.log(`${echecs.length} problème(s) :`);
  for (const e of echecs) console.log('  x ' + e);
  process.exit(1);
}
console.log('Parcours clavier : aucun problème.');
