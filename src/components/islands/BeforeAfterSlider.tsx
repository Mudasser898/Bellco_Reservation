import { useId, useState } from 'react';

/**
 * Comparateur avant / après.
 *
 * Le curseur est un véritable <input type="range"> rendu transparent et
 * superposé aux photos. C'est volontaire : on hérite ainsi du clavier (flèches,
 * Origine, Fin), du tactile, de la restitution vocale et du rôle ARIA sans
 * réimplémenter quoi que ce soit — là où un <div> avec des gestionnaires de
 * souris aurait demandé tout ce travail, et l'aurait moins bien fait.
 *
 * Seul îlot React de la page, avec le formulaire de devis.
 */

export type ImageComparee = {
  readonly src: string;
  readonly srcSet: string;
  readonly alt: string;
};

type Props = {
  readonly avant: ImageComparee;
  readonly apres: ImageComparee;
  /** Rapport largeur/hauteur, pour réserver la place avant chargement. */
  readonly ratio?: number;
};

export default function BeforeAfterSlider({ avant, apres, ratio = 4 / 3 }: Props) {
  const [position, setPosition] = useState(50);
  const idCurseur = useId();

  return (
    <figure className="comparateur">
      <div className="comparateur-cadre" style={{ aspectRatio: String(ratio) }}>
        {/* Photo « après » en fond, visible sur toute la largeur. */}
        <img
          src={apres.src}
          srcSet={apres.srcSet}
          sizes="(min-width: 1120px) 66vw, 100vw"
          alt={apres.alt}
          className="comparateur-image"
          loading="lazy"
          decoding="async"
        />

        {/* Photo « avant » par-dessus, rognée à la position du curseur.
            aria-hidden : son contenu est décrit par l'étiquette du curseur,
            et la lecture des deux alt à la suite serait déroutante. */}
        <div
          className="comparateur-calque"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden="true"
        >
          <img
            src={avant.src}
            srcSet={avant.srcSet}
            sizes="(min-width: 1120px) 66vw, 100vw"
            alt=""
            className="comparateur-image"
            loading="lazy"
            decoding="async"
          />
        </div>

        <span className="comparateur-etiquette comparateur-etiquette--avant">Avant</span>
        <span className="comparateur-etiquette comparateur-etiquette--apres">Après</span>

        {/* Poignée : purement décorative, le curseur natif fait le travail. */}
        <div className="comparateur-poignee" style={{ left: `${position}%` }} aria-hidden="true">
          <span className="comparateur-bouton">
            <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
              <path
                d="M9 6 4 12l5 6M15 6l5 6-5 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <label className="sr-only" htmlFor={idCurseur}>
          Comparer l’avant et l’après : déplacez le curseur pour révéler la photo prise
          avant les travaux.
        </label>
        <input
          id={idCurseur}
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(evenement) => setPosition(Number(evenement.target.value))}
          className="comparateur-curseur"
          aria-valuetext={`${position} % de la photo avant travaux est visible`}
        />
      </div>

      <figcaption className="comparateur-legende">
        <span className="sr-only">Avant les travaux : </span>
        {avant.alt}
      </figcaption>
    </figure>
  );
}
