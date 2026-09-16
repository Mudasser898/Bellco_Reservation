import { sanityClient } from 'sanity:client';

export { sanityClient };

/**
 * Le dataset est-il réellement configuré ?
 *
 * Tant que M. Assim n'a pas créé son projet Sanity, `.env` contient un
 * identifiant factice. On veut que le site continue de se construire dans cet
 * état — sinon impossible de travailler sur la mise en page — mais sans jamais
 * laisser croire que tout va bien.
 */
const identifiant = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
/**
 * Identifiant factice posé par astro.config.mjs quand la variable
 * d'environnement est absente. Les deux valeurs doivent rester alignées.
 */
const SANITY_NON_CONFIGURE = 'ffffffff';

export const sanityConfigure =
  Boolean(identifiant) && identifiant !== SANITY_NON_CONFIGURE && identifiant !== 'aaaaaaaa';

let avertissementEmis = false;

/**
 * Exécute une requête GROQ en renvoyant `repli` si le CMS est injoignable.
 *
 * Le build ne doit pas exploser parce que le réseau a hoqueté ou parce que le
 * dataset n'existe pas encore. En revanche l'incident est toujours signalé
 * dans la console : une page vide en production doit être visible dans les
 * logs de déploiement, pas silencieuse.
 *
 * @param requete  Requête GROQ.
 * @param params   Paramètres de la requête.
 * @param repli    Valeur renvoyée si la requête échoue.
 */
export async function requeteSanity<T>(
  requete: string,
  params: Record<string, unknown> = {},
  repli: T,
): Promise<T> {
  if (!sanityConfigure) {
    if (!avertissementEmis) {
      console.warn(
        '[sanity] PUBLIC_SANITY_PROJECT_ID absent ou factice — le site est construit ' +
          'avec des contenus vides. Renseignez .env pour afficher les données réelles.',
      );
      avertissementEmis = true;
    }
    return repli;
  }

  try {
    return await sanityClient.fetch<T>(requete, params);
  } catch (erreur) {
    console.error(
      '[sanity] Échec de la requête — la page sera construite avec la valeur de repli.\n' +
        `  Requête : ${requete.slice(0, 120).replace(/\s+/g, ' ')}…\n` +
        `  Cause   : ${erreur instanceof Error ? erreur.message : String(erreur)}`,
    );
    return repli;
  }
}
