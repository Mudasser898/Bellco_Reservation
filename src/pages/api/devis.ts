import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { schemaDevis, LIBELLES, type DonneesDevis } from '~/lib/schemas/devis';
import { ENTREPRISE } from '~/lib/site';

/**
 * Réception d'une demande de devis.
 *
 * Seule route rendue à la demande : tout le reste du site est statique.
 *
 * Trois barrières, la moins coûteuse d'abord :
 *   1. validation Zod, avec le schéma partagé du formulaire ;
 *   2. vérification du jeton Turnstile auprès de Cloudflare ;
 *   3. envoi de l'e-mail via Resend.
 *
 * Les réponses au client restent peu bavardes sur les causes d'échec côté
 * serveur : le détail part dans les journaux, pas dans le corps de réponse.
 */
export const prerender = false;

const JSON_ENTETES = { 'Content-Type': 'application/json; charset=utf-8' } as const;

const reponse = (corps: Record<string, unknown>, statut: number) =>
  new Response(JSON.stringify(corps), { status: statut, headers: JSON_ENTETES });

/** Message de repli commun, qui laisse toujours une porte de sortie au client. */
const REPLI_TELEPHONE = `Appelez-nous au ${ENTREPRISE.telephoneAffiche}, nous prenons votre demande directement.`;

/** Échappe le texte saisi avant de le glisser dans l'e-mail HTML. */
function echapper(valeur: string): string {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Vérifie le jeton Turnstile auprès de Cloudflare.
 *
 * @returns `true` si le jeton est valide, ou si Turnstile n'est pas configuré
 *   — la protection est alors simplement absente, et l'incident journalisé,
 *   plutôt que de bloquer toutes les demandes.
 */
async function verifierTurnstile(jeton: string | undefined, ip: string | null): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[devis] TURNSTILE_SECRET_KEY absente — vérification anti-robot désactivée.');
    return true;
  }
  if (!jeton) return false;

  const corps = new FormData();
  corps.append('secret', secret);
  corps.append('response', jeton);
  if (ip) corps.append('remoteip', ip);

  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: corps,
    });
    const resultat = (await r.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!resultat.success) {
      console.warn('[devis] Turnstile a refusé le jeton :', resultat['error-codes']?.join(', '));
    }
    return resultat.success === true;
  } catch (erreur) {
    console.error('[devis] Turnstile injoignable :', erreur);
    // Cloudflare indisponible : on laisse passer plutôt que de perdre un
    // prospect. Le spam éventuel reste filtrable en aval.
    return true;
  }
}

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

  const sujet = `Demande de devis — ${LIBELLES.typeDeBien[d.typeDeBien]} ${d.surface} m² (${d.codePostal})`;
  const horodatage = new Date().toLocaleString('fr-FR');

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
  /* --- 1. Lecture et validation ----------------------------------------- */
  let brut: unknown;
  try {
    brut = await request.json();
  } catch {
    return reponse({ ok: false, message: 'Requête illisible.' }, 400);
  }

  const resultat = schemaDevis.safeParse(brut);
  if (!resultat.success) {
    return reponse(
      {
        ok: false,
        message: 'Certains champs sont à corriger.',
        erreurs: z.flattenError(resultat.error).fieldErrors,
      },
      422,
    );
  }
  const donnees = resultat.data;

  /* --- 2. Anti-robot ------------------------------------------------------ */
  /* `Astro.clientAddress` n'est pas implémenté par l'adaptateur Cloudflare :
     y accéder lève une exception et fait échouer toute la requête. Cloudflare
     fournit l'adresse dans un en-tête, que l'on lit directement. */
  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await verifierTurnstile(donnees.turnstileToken, ip))) {
    return reponse(
      {
        ok: false,
        message: `La vérification anti-robot a échoué. Rechargez la page et réessayez. ${REPLI_TELEPHONE}`,
      },
      403,
    );
  }

  /* --- 3. Envoi ------------------------------------------------------------ */
  const cleResend = import.meta.env.RESEND_API_KEY;
  const expediteur = import.meta.env.DEVIS_FROM_EMAIL;
  const destinataire = import.meta.env.DEVIS_TO_EMAIL ?? ENTREPRISE.email;

  if (!cleResend || !expediteur) {
    // On ne journalise pas les coordonnées du prospect : seulement de quoi
    // diagnostiquer la panne.
    console.error('[devis] RESEND_API_KEY ou DEVIS_FROM_EMAIL absente — demande non transmise.');
    return reponse(
      { ok: false, message: `L’envoi est momentanément indisponible. ${REPLI_TELEPHONE}` },
      503,
    );
  }

  const { sujet, html, texte } = corpsEmail(donnees);

  try {
    const resend = new Resend(cleResend);
    const envoi = await resend.emails.send({
      from: `Formulaire Bellco <${expediteur}>`,
      to: [destinataire],
      // Répondre au message répond au client, pas au formulaire.
      replyTo: donnees.email,
      subject: sujet,
      html,
      text: texte,
    });

    if (envoi.error) {
      console.error('[devis] Resend a refusé l’envoi :', envoi.error);
      return reponse(
        { ok: false, message: `L’envoi a échoué. Réessayez dans un instant. ${REPLI_TELEPHONE}` },
        502,
      );
    }

    return reponse({ ok: true }, 200);
  } catch (erreur) {
    console.error('[devis] Erreur inattendue à l’envoi :', erreur);
    return reponse(
      { ok: false, message: `L’envoi a échoué. Réessayez dans un instant. ${REPLI_TELEPHONE}` },
      500,
    );
  }
};

/** Toute autre méthode est refusée explicitement. */
export const ALL: APIRoute = () => reponse({ ok: false, message: 'Méthode non autorisée.' }, 405);
