import type { StructureResolver } from 'sanity/structure';

/**
 * Organisation du Studio.
 *
 * « Réglages du site » est un document unique : on l'ouvre directement au lieu
 * d'afficher une liste où M. Assim pourrait en créer un second par erreur.
 * L'ordre suit la fréquence d'usage : réalisations et articles en premier.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Bellco Rénovation')
    .items([
      S.documentTypeListItem('project').title('Réalisations'),
      S.documentTypeListItem('post').title('Articles de blog'),
      S.documentTypeListItem('temoignage').title('Témoignages'),
      S.divider(),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('commune').title('Communes'),
      S.divider(),
      S.listItem()
        .title('Réglages du site')
        .id('settings')
        .child(S.document().schemaType('settings').documentId('settings').title('Réglages du site')),
    ]);
