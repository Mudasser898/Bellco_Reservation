import { useRef, useState, type SubmitEvent } from 'react';
import {
  BUDGETS,
  DELAIS,
  ETAPES,
  LIBELLES,
  LIBELLES_ETAPES,
  POSTES_TRAVAUX,
  TYPES_DE_BIEN,
  validerEtape,
} from '~/lib/schemas/devis';
import { ChampTexte, ChoixMultiple, ChoixUnique, Coordonnees } from './QuoteFormFields';

/**
 * Formulaire de devis en six étapes.
 *
 * — L'état est conservé d'une étape à l'autre : revenir en arrière ne fait
 *   rien perdre.
 * — Chaque étape est validée avant le passage à la suivante, avec le même
 *   schéma Zod que l'endpoint.
 * — Les erreurs sont annoncées : aria-invalid sur le champ, message relié par
 *   aria-describedby, et le focus porté sur le premier champ en faute.
 * — Le fil de progression est un vrai role="progressbar", pas une frise
 *   décorative.
 */

type Etat = Record<string, unknown>;

type Props = {
  /** Clé publique Turnstile. Le widget est omis si elle est absente. */
  readonly cleTurnstile?: string | undefined;
};

export default function QuoteForm({ cleTurnstile }: Props) {
  const [etape, setEtape] = useState(0);
  const [valeurs, setValeurs] = useState<Etat>({ travaux: [] });
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState<'repos' | 'en-cours' | 'envoye' | 'erreur'>('repos');
  const [messageServeur, setMessageServeur] = useState('');
  const titreRef = useRef<HTMLHeadingElement>(null);

  const derniere = etape === ETAPES.length - 1;
  const etapeCourante = ETAPES[etape]!;

  const definir = (champ: string, valeur: unknown) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    // L'erreur disparaît dès la correction, sans attendre une nouvelle validation.
    setErreurs((e) => {
      if (!e[champ]) return e;
      const suite = { ...e };
      delete suite[champ];
      return suite;
    });
  };

  const basculerTravaux = (poste: string) => {
    const actuels = (valeurs.travaux as string[] | undefined) ?? [];
    definir(
      'travaux',
      actuels.includes(poste) ? actuels.filter((p) => p !== poste) : [...actuels, poste],
    );
  };

  /** Porte le focus sur le premier champ en faute, sinon sur le titre d'étape. */
  const porterFocus = (champsEnFaute: string[]) => {
    requestAnimationFrame(() => {
      const premier = champsEnFaute[0];
      const cible = premier
        ? document.querySelector<HTMLElement>(`[name="${premier}"]`)
        : titreRef.current;
      cible?.focus();
    });
  };

  const suivant = () => {
    const probleme = validerEtape(etape, valeurs);
    setErreurs(probleme);
    if (Object.keys(probleme).length > 0) {
      porterFocus(Object.keys(probleme));
      return;
    }
    setEtape((n) => n + 1);
    porterFocus([]);
  };

  const precedent = () => {
    setErreurs({});
    setEtape((n) => Math.max(0, n - 1));
    porterFocus([]);
  };

  const envoyer = async (evenement: SubmitEvent<HTMLFormElement>) => {
    evenement.preventDefault();
    const probleme = validerEtape(etape, valeurs);
    setErreurs(probleme);
    if (Object.keys(probleme).length > 0) {
      porterFocus(Object.keys(probleme));
      return;
    }

    setEnvoi('en-cours');
    setMessageServeur('');

    const jeton =
      document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value ||
      undefined;

    try {
      // Barre finale obligatoire : le site est en trailingSlash 'always',
      // et /api/devis sans barre renvoie 404.
      const reponse = await fetch('/api/devis/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...valeurs, turnstileToken: jeton }),
      });
      const corps = (await reponse.json()) as {
        ok?: boolean;
        message?: string;
        erreurs?: Record<string, string[]>;
      };

      if (reponse.ok && corps.ok) {
        setEnvoi('envoye');
        return;
      }

      // Le serveur renvoie les mêmes clés de champ : on les réaffiche en place.
      if (corps.erreurs) {
        const remises: Record<string, string> = {};
        for (const [champ, messages] of Object.entries(corps.erreurs)) {
          if (messages[0]) remises[champ] = messages[0];
        }
        setErreurs(remises);
      }
      setEnvoi('erreur');
      setMessageServeur(
        corps.message ??
          'L’envoi a échoué. Réessayez dans un instant, ou appelez-nous au 07 66 25 14 36.',
      );
    } catch {
      setEnvoi('erreur');
      setMessageServeur(
        'Connexion impossible. Vérifiez votre réseau, ou appelez-nous au 07 66 25 14 36.',
      );
    }
  };

  if (envoi === 'envoye') {
    return (
      <div role="status">
        <h2 className="font-display text-h2">Demande envoyée.</h2>
        <p className="text-ink-700 mt-4 max-w-measure text-body">
          Merci. Nous revenons vers vous sous 48 heures ouvrées pour convenir d’une date de
          visite. Si votre projet est urgent, appelez-nous directement au{' '}
          <a href="tel:+33766251436" className="link-rule font-semibold">
            07 66 25 14 36
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} noValidate className="devis-formulaire">
      <div
        role="progressbar"
        /* aria-valuetext decrit la valeur, pas le role : sans nom accessible, un
           lecteur decran annonce une barre de progression anonyme. */
        aria-label="Progression de la demande de devis"
        aria-valuemin={1}
        aria-valuemax={ETAPES.length}
        aria-valuenow={etape + 1}
        aria-valuetext={`Étape ${etape + 1} sur ${ETAPES.length} : ${LIBELLES_ETAPES[etape]}`}
        className="devis-progression"
      >
        {LIBELLES_ETAPES.map((libelle, i) => (
          <span
            key={libelle}
            className="devis-jalon"
            data-etat={i < etape ? 'fait' : i === etape ? 'courant' : 'a-venir'}
          >
            <span className="devis-jalon-barre" aria-hidden="true" />
            <span className="devis-jalon-texte">{libelle}</span>
          </span>
        ))}
      </div>

      <h2 ref={titreRef} tabIndex={-1} className="font-display text-h3 devis-titre">
        {etapeCourante.titre}
      </h2>

      <div className="mt-8">
        {etape === 0 && (
          <ChoixUnique
            nom="typeDeBien"
            legende="Type de bien"
            options={TYPES_DE_BIEN.map((v) => ({ valeur: v, libelle: LIBELLES.typeDeBien[v] }))}
            valeur={valeurs.typeDeBien as string | undefined}
            onChoix={(v) => definir('typeDeBien', v)}
            erreur={erreurs.typeDeBien}
          />
        )}

        {etape === 1 && (
          <ChampTexte
            nom="surface"
            libelle="Surface concernée"
            aide="En mètres carrés. La surface touchée par les travaux, pas nécessairement celle du logement entier."
            type="number"
            inputMode="numeric"
            valeur={valeurs.surface === undefined ? '' : String(valeurs.surface)}
            onSaisie={(v) => definir('surface', v === '' ? undefined : Number(v))}
            erreur={erreurs.surface}
            suffixe="m²"
          />
        )}

        {etape === 2 && (
          <ChoixMultiple
            nom="travaux"
            legende="Travaux souhaités — plusieurs choix possibles"
            options={POSTES_TRAVAUX.map((v) => ({ valeur: v, libelle: LIBELLES.travaux[v] }))}
            valeurs={(valeurs.travaux as string[] | undefined) ?? []}
            onBascule={basculerTravaux}
            erreur={erreurs.travaux}
          />
        )}

        {etape === 3 && (
          <ChoixUnique
            nom="budget"
            legende="Budget approximatif"
            options={BUDGETS.map((v) => ({ valeur: v, libelle: LIBELLES.budget[v] }))}
            valeur={valeurs.budget as string | undefined}
            onChoix={(v) => definir('budget', v)}
            erreur={erreurs.budget}
          />
        )}

        {etape === 4 && (
          <ChoixUnique
            nom="delai"
            legende="Délai souhaité"
            options={DELAIS.map((v) => ({ valeur: v, libelle: LIBELLES.delai[v] }))}
            valeur={valeurs.delai as string | undefined}
            onChoix={(v) => definir('delai', v)}
            erreur={erreurs.delai}
          />
        )}

        {etape === 5 && (
          <Coordonnees
            valeurs={valeurs}
            erreurs={erreurs}
            onSaisie={definir}
            cleTurnstile={cleTurnstile}
          />
        )}
      </div>

      {envoi === 'erreur' && messageServeur && (
        <p className="devis-erreur-envoi" role="alert">
          {messageServeur}
        </p>
      )}

      <div className="devis-actions">
        {etape > 0 && (
          <button
            type="button"
            onClick={precedent}
            className="devis-bouton devis-bouton--secondaire"
          >
            Retour
          </button>
        )}

        {derniere ? (
          <button type="submit" className="devis-bouton" disabled={envoi === 'en-cours'}>
            {envoi === 'en-cours' ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        ) : (
          <button type="button" onClick={suivant} className="devis-bouton">
            Continuer
          </button>
        )}
      </div>

      <p className="text-ink-500 mt-6 text-caption">
        Étape {etape + 1} sur {ETAPES.length}. Vos réponses sont conservées si vous revenez en
        arrière.
      </p>
    </form>
  );
}
