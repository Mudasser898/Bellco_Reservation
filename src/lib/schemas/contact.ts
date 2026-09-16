import { z } from 'zod';

/**
 * Schéma du formulaire de contact — partagé client et serveur, comme celui du
 * devis. Plus court : ici on ne qualifie pas un projet, on ouvre une
 * conversation.
 *
 * Les messages de type sont annotés au niveau du type et non de la seule
 * contrainte, sans quoi Zod remonterait ses libellés par défaut, en anglais.
 */

const TELEPHONE = /^(?:(?:\+|00)33[\s.-]?[1-9]|0[1-9])(?:[\s.-]?\d{2}){4}$/;

export const schemaContact = z.object({
  nom: z
    .string({ error: 'Indiquez votre nom.' })
    .trim()
    .min(2, { error: 'Indiquez votre nom (2 caractères minimum).' })
    .max(80, { error: 'Ce nom dépasse 80 caractères.' }),

  email: z
    .email({ error: 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.' })
    .max(150, { error: 'Cette adresse dépasse 150 caractères.' }),

  /* Facultatif : une chaîne vide est acceptée et traitée comme une absence. */
  telephone: z
    .string({ error: 'Le téléphone doit être du texte.' })
    .trim()
    .regex(TELEPHONE, { error: 'Indiquez un numéro français valide, par exemple 06 12 34 56 78.' })
    .optional()
    .or(z.literal('')),

  sujet: z
    .string({ error: 'Indiquez l’objet de votre message.' })
    .trim()
    .min(3, { error: 'Indiquez l’objet de votre message.' })
    .max(120, { error: 'Cet objet dépasse 120 caractères.' }),

  message: z
    .string({ error: 'Écrivez votre message.' })
    .trim()
    .min(20, { error: 'Détaillez un peu votre demande (20 caractères minimum).' })
    .max(3000, { error: 'Votre message dépasse 3 000 caractères.' }),

  consentement: z.literal(true, {
    error: 'Vous devez accepter que vos données soient utilisées pour vous répondre.',
  }),

  turnstileToken: z.string().min(1).optional(),
});

export type DonneesContact = z.infer<typeof schemaContact>;

/** Valide l'ensemble et renvoie un objet champ → message. */
export function validerContact(valeurs: Record<string, unknown>): Record<string, string> {
  const resultat = schemaContact.safeParse(valeurs);
  if (resultat.success) return {};
  const erreurs: Record<string, string> = {};
  for (const probleme of resultat.error.issues) {
    const champ = String(probleme.path[0] ?? '');
    if (champ && !erreurs[champ]) erreurs[champ] = probleme.message;
  }
  return erreurs;
}
