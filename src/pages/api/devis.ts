import type { APIRoute } from 'astro';
import { z } from 'zod';
import { schemaDevis, LIBELLES, type DonneesDevis } from '~/lib/schemas/devis';
import {
  echapper,
  envoyerCourriel,
  ipClient,
  REPLI_TELEPHONE,
  reponseJson,
  verifierTurnstile,
} from '~/lib/courriel';

/**
 * Réception d'une demande de devis.
 *
 * Route rendue à la demande ; tout le reste du site est statique.
 * Trois barrières, la moins coûteuse d'abord : validation Zod, vérification
 * Turnstile, puis envoi. Les causes d'échec détaillées partent dans les
 * journaux, pas dans la réponse.
 */
export const prerender = false;

/** Compose l'e-mail envoyé à l'entreprise. */
function corpsEmail(d: DonneesDevis): { sujet: string; html: string; texte: string } {
  const lignes: [string, string][] = [
    ['Type de bien', LIBELLES.typeDeBien[d.typeDeBien]],
    ['Surface', `${d.surface} m²`],
    ['Travaux', d.travaux.map((t) => LIBELLES.travaux[t]).join(', ')],
    ['Budget', LIBELLES.budget[d.budget]],
    ['Délai', LIBELLES.delai[d.delai]],
    ['Code postal', d.codePostal],
    ['Nom', d.nom],
    ['E-mail', d.email],
    ['Téléphone', d.telephone],
  ];
  if (d.message) lignes.push(['Précisions', d.message]);

  const horodatage = new Date().toLocaleString('fr-FR');
  const sujet = `Demande de devis — ${LIBELLES.typeDeBien[d.typeDeBien]} ${d.surface} m² (${d.codePostal})`;

  const html = [
    '<h2 style="font-family:Georgia,serif">Nouvelle demande de devis</h2>',
    '<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:15px">',
    ...lignes.map(
      ([cle, valeur]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b625b;vertical-align:top">${echapper(cle)}</td>` +
        `<td style="padding:6px 0"><strong>${echapper(valeur)}</strong></td></tr>`,
    ),
    '</table>',
    `<p style="font-family:system-ui,sans-serif;font-size:13px;color:#6b625b">Consentement RGPD accepté le ${horodatage}.</p>`,
  ].join('');

  const texte = [
    'Nouvelle demande de devis',
    '',
    ...lignes.map(([cle, valeur]) => `${cle} : ${valeur}`),
    '',
    `Consentement RGPD accepté le ${horodatage}.`,
  ].join('\n');

  return { sujet, html, texte };
}

export const POST: APIRoute = async ({ request }) => {
  let brut: unknown;
  try {
    brut = await request.json();
  } catch {
    return reponseJson({ ok: false, message: 'Requête illisible.' }, 400);
  }

  const resultat = schemaDevis.safeParse(brut);
  if (!resultat.success) {
    return reponseJson(
      {
        ok: false,
        message: 'Certains champs sont à corriger.',
        erreurs: z.flattenError(resultat.error).fieldErrors,
      },
      422,
    );
  }
  const donnees = resultat.data;

  if (!(await verifierTurnstile(donnees.turnstileToken, ipClient(request)))) {
    return reponseJson(
      {
        ok: false,
        message: `La vérification anti-robot a échoué. Rechargez la page et réessayez. ${REPLI_TELEPHONE}`,
      },
      403,
    );
  }

  const { sujet, html, texte } = corpsEmail(donnees);
  const envoi = await envoyerCourriel({ sujet, html, texte, repondreA: donnees.email });
  if (!envoi.ok) {
    return reponseJson({ ok: false, message: envoi.message }, envoi.statut);
  }
  return reponseJson({ ok: true }, 200);
};

/** Toute autre méthode est refusée explicitement. */
export const ALL: APIRoute = () =>
  reponseJson({ ok: false, message: 'Méthode non autorisée.' }, 405);
