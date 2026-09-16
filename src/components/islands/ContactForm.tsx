import { useState, type SubmitEvent } from 'react';
import { validerContact } from '~/lib/schemas/contact';
import { ChampTexte } from './QuoteFormFields';

/**
 * Formulaire de contact.
 *
 * Plus court que celui du devis : une seule page, pas d'étapes. Il réutilise
 * les mêmes champs et le même traitement d'erreur, pour que les deux
 * formulaires se comportent à l'identique sous le clavier et le lecteur
 * d'écran.
 */

type Props = {
  readonly cleTurnstile?: string | undefined;
};

export default function ContactForm({ cleTurnstile }: Props) {
  const [valeurs, setValeurs] = useState<Record<string, unknown>>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState<'repos' | 'en-cours' | 'envoye' | 'erreur'>('repos');
  const [messageServeur, setMessageServeur] = useState('');

  const definir = (champ: string, valeur: unknown) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    setErreurs((e) => {
      if (!e[champ]) return e;
      const suite = { ...e };
      delete suite[champ];
      return suite;
    });
  };

  const envoyer = async (evenement: SubmitEvent<HTMLFormElement>) => {
    evenement.preventDefault();
    const probleme = validerContact(valeurs);
    setErreurs(probleme);
    if (Object.keys(probleme).length > 0) {
      const premier = Object.keys(probleme)[0];
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`[name="${premier}"]`)?.focus(),
      );
      return;
    }

    setEnvoi('en-cours');
    setMessageServeur('');
    const jeton =
      document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value ||
      undefined;

    try {
      // Barre finale obligatoire : le site est en trailingSlash 'always'.
      const reponse = await fetch('/api/contact/', {
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
          'L’envoi a échoué. Réessayez, ou appelez-nous au 07 66 25 14 36.',
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
        <h2 className="font-display text-h3">Message envoyé.</h2>
        <p className="text-ink-700 mt-4 max-w-measure text-body">
          Merci. Nous vous répondons sous 48 heures ouvrées. Pour une demande urgente,
          appelez-nous au{' '}
          <a href="tel:+33766251436" className="link-rule font-semibold">
            07 66 25 14 36
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} noValidate className="flex flex-col gap-6">
      <ChampTexte
        nom="nom"
        libelle="Nom et prénom"
        autoComplete="name"
        valeur={(valeurs.nom as string) ?? ''}
        onSaisie={(v) => definir('nom', v)}
        erreur={erreurs.nom}
      />
      <ChampTexte
        nom="email"
        libelle="Adresse e-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        valeur={(valeurs.email as string) ?? ''}
        onSaisie={(v) => definir('email', v)}
        erreur={erreurs.email}
      />
      <ChampTexte
        nom="telephone"
        libelle="Téléphone (facultatif)"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        valeur={(valeurs.telephone as string) ?? ''}
        onSaisie={(v) => definir('telephone', v)}
        erreur={erreurs.telephone}
      />
      <ChampTexte
        nom="sujet"
        libelle="Objet"
        aide="En quelques mots : « Devis salle de bain », « Question sur un chantier en cours »."
        valeur={(valeurs.sujet as string) ?? ''}
        onSaisie={(v) => definir('sujet', v)}
        erreur={erreurs.sujet}
      />
      <ChampTexte
        nom="message"
        libelle="Votre message"
        multiligne
        valeur={(valeurs.message as string) ?? ''}
        onSaisie={(v) => definir('message', v)}
        erreur={erreurs.message}
      />

      <div className="devis-groupe">
        <label className="devis-consentement" htmlFor="contact-consentement">
          <input
            id="contact-consentement"
            name="consentement"
            type="checkbox"
            checked={valeurs.consentement === true}
            onChange={(e) => definir('consentement', e.target.checked ? true : undefined)}
            className="devis-controle"
            aria-invalid={erreurs.consentement ? 'true' : undefined}
            aria-describedby={erreurs.consentement ? 'contact-consentement-erreur' : undefined}
          />
          <span>
            J’accepte que mes informations soient utilisées par Bellco Rénovation pour
            répondre à mon message. Elles ne sont ni revendues ni utilisées à d’autres
            fins.{' '}
            <a href="/politique-de-confidentialite/" className="link-rule">
              Politique de confidentialité
            </a>
            .
          </span>
        </label>
        {erreurs.consentement && (
          <p id="contact-consentement-erreur" className="devis-message-erreur">
            {erreurs.consentement}
          </p>
        )}
      </div>

      {cleTurnstile && (
        <div className="cf-turnstile" data-sitekey={cleTurnstile} data-language="fr" />
      )}

      {envoi === 'erreur' && messageServeur && (
        <p className="devis-erreur-envoi" role="alert">
          {messageServeur}
        </p>
      )}

      <div className="devis-actions">
        <button type="submit" className="devis-bouton" disabled={envoi === 'en-cours'}>
          {envoi === 'en-cours' ? 'Envoi en cours…' : 'Envoyer le message'}
        </button>
      </div>
    </form>
  );
}
