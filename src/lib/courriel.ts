import { Resend } from 'resend';
import { ENTREPRISE } from '~/lib/site';

/**
 * Briques partagées par les endpoints de formulaire : réponses JSON,
 * vérification anti-robot et envoi d'e-mail.
 *
 * Mutualisées à dessein — deux copies de la logique anti-robot finiraient par
 * diverger, et c'est la copie oubliée qui laisserait passer le spam.
 */

const JSON_ENTETES = { 'Content-Type': 'application/json; charset=utf-8' } as const;

export const reponseJson = (corps: Record<string, unknown>, statut: number) =>
  new Response(JSON.stringify(corps), { status: statut, headers: JSON_ENTETES });

/** Repli commun : un formulaire en panne ne doit jamais être un cul-de-sac. */
export const REPLI_TELEPHONE = `Appelez-nous au ${ENTREPRISE.telephoneAffiche}, nous prenons votre demande directement.`;

/** Échappe le texte saisi avant insertion dans un e-mail HTML. */
export function echapper(valeur: string): string {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Vérifie un jeton Turnstile auprès de Cloudflare.
 *
 * @returns `true` si le jeton est valide, ou si Turnstile n'est pas configuré
 *   — la protection est alors absente et l'incident journalisé, plutôt que de
 *   bloquer toutes les demandes.
 */
export async function verifierTurnstile(
  jeton: string | undefined,
  ip: string | null,
): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[formulaire] TURNSTILE_SECRET_KEY absente — vérification anti-robot désactivée.');
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
      console.warn('[formulaire] Turnstile a refusé le jeton :', resultat['error-codes']?.join(', '));
    }
    return resultat.success === true;
  } catch (erreur) {
    console.error('[formulaire] Turnstile injoignable :', erreur);
    // Cloudflare indisponible : on laisse passer plutôt que de perdre un
    // prospect. Le spam éventuel reste filtrable en aval.
    return true;
  }
}

/**
 * Adresse IP du client, quelle que soit la plateforme.
 *
 * Chaque hébergeur la transmet dans son propre en-tête, et `Astro.clientAddress`
 * n'est pas utilisable partout — l'adaptateur Cloudflare lève une exception si
 * on y accède. On lit donc les en-têtes directement, du plus spécifique au plus
 * général :
 *
 *   - `x-vercel-forwarded-for` : Vercel, non falsifiable par le client ;
 *   - `CF-Connecting-IP`       : Cloudflare ;
 *   - `x-forwarded-for`        : standard de fait, première entrée de la liste.
 *
 * L'adresse ne sert qu'à lier le jeton Turnstile à son émetteur. Une valeur
 * absente n'invalide pas la vérification : Cloudflare accepte l'appel sans
 * `remoteip`. Mieux vaut un contrôle légèrement moins strict qu'un formulaire
 * qui refuse tout le monde.
 */
export function ipClient(request: Request): string | null {
  const vercel = request.headers.get('x-vercel-forwarded-for');
  if (vercel) return vercel.split(',')[0]!.trim();

  const cloudflare = request.headers.get('CF-Connecting-IP');
  if (cloudflare) return cloudflare.trim();

  const transmis = request.headers.get('x-forwarded-for');
  if (transmis) return transmis.split(',')[0]!.trim();

  return request.headers.get('x-real-ip');
}

export type ResultatEnvoi =
  | { readonly ok: true }
  | { readonly ok: false; readonly statut: number; readonly message: string };

/**
 * Envoie un e-mail via Resend.
 *
 * @param repondreA Adresse du prospect : répondre au message lui répond à lui,
 *   pas au formulaire.
 */
export async function envoyerCourriel(params: {
  readonly sujet: string;
  readonly html: string;
  readonly texte: string;
  readonly repondreA: string;
}): Promise<ResultatEnvoi> {
  const cle = import.meta.env.RESEND_API_KEY;
  const expediteur = import.meta.env.DEVIS_FROM_EMAIL;
  const destinataire = import.meta.env.DEVIS_TO_EMAIL ?? ENTREPRISE.email;

  if (!cle || !expediteur) {
    // On ne journalise pas les coordonnées : seulement de quoi diagnostiquer.
    console.error('[formulaire] RESEND_API_KEY ou DEVIS_FROM_EMAIL absente — message non transmis.');
    return {
      ok: false,
      statut: 503,
      message: `L’envoi est momentanément indisponible. ${REPLI_TELEPHONE}`,
    };
  }

  try {
    const resend = new Resend(cle);
    const envoi = await resend.emails.send({
      from: `Formulaire Bellco <${expediteur}>`,
      to: [destinataire],
      replyTo: params.repondreA,
      subject: params.sujet,
      html: params.html,
      text: params.texte,
    });

    if (envoi.error) {
      console.error('[formulaire] Resend a refusé l’envoi :', envoi.error);
      return {
        ok: false,
        statut: 502,
        message: `L’envoi a échoué. Réessayez dans un instant. ${REPLI_TELEPHONE}`,
      };
    }
    return { ok: true };
  } catch (erreur) {
    console.error('[formulaire] Erreur inattendue à l’envoi :', erreur);
    return {
      ok: false,
      statut: 500,
      message: `L’envoi a échoué. Réessayez dans un instant. ${REPLI_TELEPHONE}`,
    };
  }
}
