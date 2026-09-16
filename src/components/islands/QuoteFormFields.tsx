import { useId } from 'react';

/**
 * Champs du formulaire de devis.
 *
 * Chaque champ relie son message d'erreur par aria-describedby et porte
 * aria-invalid : l'erreur est ainsi lue au moment où l'on atteint le champ,
 * et pas seulement affichée en rouge à côté.
 */

type Option = { readonly valeur: string; readonly libelle: string };

/** Message d'erreur d'un champ, relié par son identifiant. */
function Erreur({ id, message }: { readonly id: string; readonly message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="devis-message-erreur">
      {message}
    </p>
  );
}

/* -------------------------------------------------------------------------- */

export function ChoixUnique({
  nom,
  legende,
  options,
  valeur,
  onChoix,
  erreur,
}: {
  readonly nom: string;
  readonly legende: string;
  readonly options: readonly Option[];
  readonly valeur: string | undefined;
  readonly onChoix: (v: string) => void;
  readonly erreur?: string | undefined;
}) {
  const idErreur = `${nom}-erreur`;
  return (
    <fieldset aria-invalid={erreur ? 'true' : undefined} aria-describedby={erreur ? idErreur : undefined}>
      <legend className="sr-only">{legende}</legend>
      <div className="devis-options">
        {options.map((option, index) => (
          <label key={option.valeur} className="devis-option">
            <input
              type="radio"
              /* Le premier bouton porte l'attribut name attendu par le focus
                 d'erreur ; les suivants partagent le même groupe. */
              name={nom}
              value={option.valeur}
              checked={valeur === option.valeur}
              onChange={() => onChoix(option.valeur)}
              className="devis-controle"
              aria-describedby={erreur && index === 0 ? idErreur : undefined}
            />
            <span className="devis-option-texte">{option.libelle}</span>
          </label>
        ))}
      </div>
      <Erreur id={idErreur} message={erreur} />
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */

export function ChoixMultiple({
  nom,
  legende,
  options,
  valeurs,
  onBascule,
  erreur,
}: {
  readonly nom: string;
  readonly legende: string;
  readonly options: readonly Option[];
  readonly valeurs: readonly string[];
  readonly onBascule: (v: string) => void;
  readonly erreur?: string | undefined;
}) {
  const idErreur = `${nom}-erreur`;
  return (
    <fieldset aria-describedby={erreur ? idErreur : undefined}>
      <legend className="devis-legende">{legende}</legend>
      <div className="devis-options mt-4">
        {options.map((option, index) => (
          <label key={option.valeur} className="devis-option">
            <input
              type="checkbox"
              name={index === 0 ? nom : `${nom}-${option.valeur}`}
              value={option.valeur}
              checked={valeurs.includes(option.valeur)}
              onChange={() => onBascule(option.valeur)}
              className="devis-controle"
              aria-describedby={erreur && index === 0 ? idErreur : undefined}
            />
            <span className="devis-option-texte">{option.libelle}</span>
          </label>
        ))}
      </div>
      <Erreur id={idErreur} message={erreur} />
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */

export function ChampTexte({
  nom,
  libelle,
  aide,
  type = 'text',
  inputMode,
  autoComplete,
  valeur,
  onSaisie,
  erreur,
  suffixe,
  multiligne = false,
}: {
  readonly nom: string;
  readonly libelle: string;
  readonly aide?: string;
  readonly type?: string;
  readonly inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  readonly autoComplete?: string;
  readonly valeur: string;
  readonly onSaisie: (v: string) => void;
  readonly erreur?: string | undefined;
  readonly suffixe?: string;
  readonly multiligne?: boolean;
}) {
  const idChamp = useId();
  const idAide = `${idChamp}-aide`;
  const idErreur = `${idChamp}-erreur`;
  const decrit = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(' ');

  const communs = {
    id: idChamp,
    name: nom,
    value: valeur,
    'aria-invalid': erreur ? ('true' as const) : undefined,
    'aria-describedby': decrit || undefined,
    className: 'devis-champ',
    autoComplete,
  };

  return (
    <div className="devis-groupe">
      <label htmlFor={idChamp} className="devis-libelle">
        {libelle}
      </label>
      {aide && (
        <p id={idAide} className="devis-aide">
          {aide}
        </p>
      )}

      <div className="devis-champ-enveloppe">
        {multiligne ? (
          <textarea
            {...communs}
            rows={5}
            onChange={(e) => onSaisie(e.target.value)}
          />
        ) : (
          <input
            {...communs}
            type={type}
            inputMode={inputMode}
            onChange={(e) => onSaisie(e.target.value)}
          />
        )}
        {suffixe && (
          <span className="devis-suffixe" aria-hidden="true">
            {suffixe}
          </span>
        )}
      </div>

      <Erreur id={idErreur} message={erreur} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Dernière étape : coordonnées, consentement RGPD et vérification anti-robot.
 *
 * Le consentement est une case obligatoire, décochée par défaut — un
 * consentement pré-coché n'en est pas un au sens du RGPD. Son libellé dit à
 * quoi servent les données et renvoie à la politique de confidentialité.
 */
export function Coordonnees({
  valeurs,
  erreurs,
  onSaisie,
  cleTurnstile,
}: {
  readonly valeurs: Record<string, unknown>;
  readonly erreurs: Record<string, string>;
  readonly onSaisie: (champ: string, valeur: unknown) => void;
  readonly cleTurnstile?: string | undefined;
}) {
  const idConsentement = useId();
  const idErreurConsentement = `${idConsentement}-erreur`;

  return (
    <div className="flex flex-col gap-6">
      <ChampTexte
        nom="nom"
        libelle="Nom et prénom"
        autoComplete="name"
        valeur={(valeurs.nom as string) ?? ''}
        onSaisie={(v) => onSaisie('nom', v)}
        erreur={erreurs.nom}
      />

      <ChampTexte
        nom="email"
        libelle="Adresse e-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        valeur={(valeurs.email as string) ?? ''}
        onSaisie={(v) => onSaisie('email', v)}
        erreur={erreurs.email}
      />

      <ChampTexte
        nom="telephone"
        libelle="Téléphone"
        aide="Pour convenir d’une date de visite, c’est le plus rapide."
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        valeur={(valeurs.telephone as string) ?? ''}
        onSaisie={(v) => onSaisie('telephone', v)}
        erreur={erreurs.telephone}
      />

      <ChampTexte
        nom="codePostal"
        libelle="Code postal du chantier"
        inputMode="numeric"
        autoComplete="postal-code"
        valeur={(valeurs.codePostal as string) ?? ''}
        onSaisie={(v) => onSaisie('codePostal', v)}
        erreur={erreurs.codePostal}
      />

      <ChampTexte
        nom="message"
        libelle="Précisions (facultatif)"
        aide="Tout ce qui nous aiderait à préparer la visite : contraintes de copropriété, état des lieux, échéance particulière."
        multiligne
        valeur={(valeurs.message as string) ?? ''}
        onSaisie={(v) => onSaisie('message', v)}
        erreur={erreurs.message}
      />

      {/* Consentement RGPD — décoché par défaut, obligatoire. */}
      <div className="devis-groupe">
        <label className="devis-consentement" htmlFor={idConsentement}>
          <input
            id={idConsentement}
            name="consentement"
            type="checkbox"
            checked={valeurs.consentement === true}
            onChange={(e) => onSaisie('consentement', e.target.checked ? true : undefined)}
            className="devis-controle"
            aria-invalid={erreurs.consentement ? 'true' : undefined}
            aria-describedby={erreurs.consentement ? idErreurConsentement : undefined}
          />
          <span>
            J’accepte que mes informations soient utilisées par Bellco Rénovation pour
            répondre à ma demande de devis. Elles ne sont ni revendues ni utilisées à
            d’autres fins.{' '}
            <a href="/politique-de-confidentialite/" className="link-rule">
              Politique de confidentialité
            </a>
            .
          </span>
        </label>
        <Erreur id={idErreurConsentement} message={erreurs.consentement} />
      </div>

      {/* Vérification anti-robot. Le widget dépose son jeton dans un champ
          caché nommé cf-turnstile-response, relu au moment de l'envoi. */}
      {cleTurnstile ? (
        <div className="cf-turnstile" data-sitekey={cleTurnstile} data-language="fr" />
      ) : (
        <p className="devis-aide">
          Vérification anti-robot désactivée : la clé Turnstile n’est pas configurée.
        </p>
      )}
    </div>
  );
}
