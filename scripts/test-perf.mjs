/**
 * Mesures de performance sur la construction de production.
 *
 * Le bridage reproduit les conditions retenues par Lighthouse pour le mobile :
 * processeur quatre fois plus lent qu'un poste de bureau, et réseau « 4G
 * lente » (1,6 Mb/s descendant, 150 ms de latence). Sans ce bridage, des
 * mesures prises en local sur un poste de développement n'apprennent rien.
 *
 * Usage : node scripts/test-perf.mjs [url]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const PAGES = [
  ['Accueil', '/'],
  ['Service', '/services/renovation-salle-de-bain/'],
  ['Réalisations', '/realisations/'],
  ['Devis (îlot React)', '/devis/'],
];

/* Seuils « bons » des Core Web Vitals. */
const SEUILS = { LCP: 2500, CLS: 0.1, FCP: 1800 };

const navigateur = await chromium.launch();
const resultats = [];

for (const [nom, chemin] of PAGES) {
  const contexte = await navigateur.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await contexte.newPage();
  const cdp = await contexte.newCDPSession(page);

  await cdp.send('Network.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  let octets = 0;
  page.on('response', async (r) => {
    try {
      const l = (await r.allHeaders())['content-length'];
      if (l) octets += Number(l);
    } catch {
      /* réponse déjà consommée */
    }
  });

  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) window.__vitals.lcp = Math.max(window.__vitals.lcp, e.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(`${BASE}${chemin}`, { waitUntil: 'load' });
  // Laisse le temps au LCP de se stabiliser et aux îlots de s'hydrater.
  await page.waitForTimeout(3500);

  const m = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const nav = performance.getEntriesByType('navigation')[0];
        const peintures = Object.fromEntries(
          performance.getEntriesByType('paint').map((e) => [e.name, e.startTime]),
        );
        const lcp = window.__vitals?.lcp ?? 0;
        const cls = window.__vitals?.cls ?? 0;
        resolve({
          ttfb: Math.round(nav.responseStart),
          fcp: Math.round(peintures['first-contentful-paint'] ?? 0),
          lcp: Math.round(lcp),
          cls: Number(cls.toFixed(4)),
          domInteractif: Math.round(nav.domInteractive),
          charge: Math.round(nav.loadEventEnd),
        });
      }),
  );

  resultats.push({ nom, ...m, octets });
  await contexte.close();
}

await navigateur.close();

console.log('PERFORMANCE — mobile 390x844, processeur bridé x4, 4G lente (1,6 Mb/s, 150 ms)\n');
console.log('page'.padEnd(22) + 'TTFB'.padEnd(9) + 'FCP'.padEnd(9) + 'LCP'.padEnd(11) + 'CLS'.padEnd(10) + 'chargé');
console.log('-'.repeat(72));
for (const r of resultats) {
  const lcp = `${r.lcp} ms${r.lcp <= SEUILS.LCP ? '' : ' !'}`;
  const cls = `${r.cls}${r.cls <= SEUILS.CLS ? '' : ' !'}`;
  console.log(
    r.nom.padEnd(22) +
      `${r.ttfb} ms`.padEnd(9) +
      `${r.fcp} ms`.padEnd(9) +
      lcp.padEnd(11) +
      cls.padEnd(10) +
      `${r.charge} ms`,
  );
}
console.log(`\nSeuils « bons » : LCP ≤ ${SEUILS.LCP} ms · CLS ≤ ${SEUILS.CLS} · FCP ≤ ${SEUILS.FCP} ms`);
console.log('Un « ! » signale un dépassement.');
