import type { APIRoute } from 'astro';
import { z } from 'zod';
import { schemaContact, type DonneesContact } from '~/lib/schemas/contact';
import {
  echapper,
  envoyerCourriel,
  ipClient,
  REPLI_TELEPHONE,
  reponseJson,
  verifierTurnstile,
} from '~/lib/courriel';

/** Réception d'un message de contact. Mêmes barrières que la demande de devis. */
export const prerender = false;

function corpsEmail(d: DonneesContact): { sujet: string; html: string; texte: string } {
  const lignes: [string, string][] = [
    ['Nom', d.nom],
    ['E-mail', d.email],
    ['Téléphone', d.telephone && d.telephone !== '' ? d.telephone : 'non communiqué'],
    ['Objet', d.sujet],
  ];
  const horodatage = new Date().toLocaleString('fr-FR');

  const html = [
    '<h2 style="font-family:Georgia,serif">Nouveau message de contact</h2>',
    '<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:15px">',
    ...lignes.map(
      ([cle, valeur]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b625b;vertical-align:top">${echapper(cle)}</td>` +
        `<td style="padding:6px 0"><strong>${echapper(valeur)}</strong></td></tr>`,
    ),
    '</table>',
    // Le message libre peut contenir des retours à la ligne : on les conserve.
    `<p style="font-family:system-ui,sans-serif;font-size:15px;white-space:pre-wrap">${echapper(d.message)}</p>`,
    `<p style="font-family:system-ui,sans-serif;font-size:13px;color:#6b625b">Consentement RGPD accepté le ${horodatage}.</p>`,
  ].join('');

  const texte = [
    'Nouveau message de contact',
    '',
    ...lignes.map(([cle, valeur]) => `${cle} : ${valeur}`),
    '',
    d.message,
    '',
    `Consentement RGPD accepté le ${horodatage}.`,
  ].join('\n');

  return { sujet: `Contact — ${d.sujet}`, html, texte };
}

export const POST: APIRoute = async ({ request }) => {
  let brut: unknown;
  try {
    brut = await request.json();
  } catch {
    return reponseJson({ ok: false, message: 'Requête illisible.' }, 400);
  }

  const resultat = schemaContact.safeParse(brut);
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

export const ALL: APIRoute = () =>
  reponseJson({ ok: false, message: 'Méthode non autorisée.' }, 405);
