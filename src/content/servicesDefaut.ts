/**
 * Contenu par défaut des pages de service.
 *
 * Ces dix pages existent dans le plan du site et doivent être complètes dès la
 * mise en ligne, avant toute saisie dans le Studio. Quand M. Assim remplit un
 * service dans Sanity, ses champs prennent le dessus un par un : un résumé
 * saisi remplace le résumé par défaut sans effacer la FAQ, et inversement.
 *
 * Aucun chiffre, aucune certification, aucune référence client ici : ce sont
 * des descriptions de prestations, vérifiables par nature.
 */

export type ContenuServiceDefaut = {
  readonly resume: string;
  /** Paragraphes d'introduction, rendus à la suite du titre. */
  readonly intro: readonly string[];
  readonly prestations: readonly string[];
  readonly faq: readonly { readonly question: string; readonly reponse: string }[];
};

export const SERVICES_DEFAUT: Readonly<Record<string, ContenuServiceDefaut>> = {
  'renovation-appartement': {
    resume:
      'Rénovation complète ou partielle d’appartement à Saint-Denis, à Paris et en Île-de-France. Nous intervenons en site occupé comme sur un logement vide, avec un planning écrit et un seul interlocuteur.',
    intro: [
      'Rénover un appartement, c’est composer avec l’existant : une distribution héritée, des réseaux encastrés dont personne ne connaît le tracé, et une copropriété qui encadre horaires et nuisances. Nous commençons donc par un relevé complet des lieux avant de chiffrer quoi que ce soit.',
      'Le devis détaille chaque poste par corps de métier, avec les quantités et les références des matériaux. Vous voyez ce que coûte la réfection de l’électricité, ce que coûte la salle de bain, et vous arbitrez ligne par ligne plutôt que de discuter un forfait global.',
    ],
    prestations: [
      'Dépose et évacuation des revêtements et cloisons existants',
      'Redistribution des volumes, ouverture ou création de cloisons',
      'Mise aux normes de l’électricité et remplacement du tableau',
      'Reprise complète de la plomberie, alimentation et évacuation',
      'Pose des sols : carrelage, parquet, revêtements souples',
      'Peinture, enduits et finitions',
      'Dossier pour le syndic et déclarations préalables si nécessaire',
    ],
    faq: [
      {
        question: 'Peut-on rester dans l’appartement pendant les travaux ?',
        reponse:
          'C’est possible sur une rénovation partielle, en phasant le chantier pièce par pièce et en maintenant un point d’eau et un WC utilisables. Sur une rénovation complète avec reprise des réseaux, la coupure d’eau et d’électricité rend l’occupation difficile : nous vous le disons à la visite plutôt que de le découvrir en cours de chantier.',
      },
      {
        question: 'Quelles autorisations faut-il en copropriété ?',
        reponse:
          'Tout ce qui touche aux parties communes ou à un mur porteur demande l’accord de la copropriété, souvent en assemblée générale. Nous préparons le dossier technique pour le syndic — nature des travaux, planning, attestations d’assurance — et vous indiquons les délais à prévoir avant le démarrage.',
      },
      {
        question: 'Comment sont gérées les nuisances pour le voisinage ?',
        reponse:
          'Nous respectons les horaires fixés par le règlement de copropriété, protégeons les parties communes sur tout le trajet emprunté et nettoyons le chantier chaque soir. Un avis de travaux affiché dans le hall en amont évite la plupart des tensions.',
      },
    ],
  },

  'renovation-maison-villa': {
    resume:
      'Rénovation de maison et de villa en Seine-Saint-Denis et en Île-de-France : redistribution, extension, reprise de l’enveloppe et amélioration des performances énergétiques.',
    intro: [
      'Une maison offre une liberté qu’un appartement n’a pas : on peut déplacer une cloison porteuse, ouvrir une toiture, agrandir. Elle expose aussi à des postes absents en copropriété — toiture, façade, réseaux enterrés, isolation par l’extérieur — qui pèsent lourd dans un budget et qu’il vaut mieux traiter dans le même chantier.',
      'Nous établissons un ordre d’intervention qui suit la logique du bâtiment : d’abord le clos et le couvert, ensuite les réseaux, enfin les finitions. Reprendre une toiture après avoir refait les peintures, c’est payer deux fois.',
    ],
    prestations: [
      'Redistribution intérieure et ouverture de murs porteurs avec étude de structure',
      'Extension et surélévation',
      'Reprise de toiture, zinguerie et évacuation des eaux pluviales',
      'Isolation des combles, des murs et des planchers bas',
      'Remplacement des menuiseries extérieures',
      'Rénovation complète des réseaux électriques et de plomberie',
      'Ravalement et finitions extérieures',
    ],
    faq: [
      {
        question: 'Une étude de structure est-elle nécessaire pour ouvrir un mur ?',
        reponse:
          'Dès qu’un mur porteur est concerné, oui. Un bureau d’études dimensionne la poutre et les descentes de charge, et sa note de calcul engage sa responsabilité. Nous ne touchons jamais à un porteur sans cette étude, quel que soit l’âge de la maison.',
      },
      {
        question: 'Faut-il un permis de construire ou une déclaration préalable ?',
        reponse:
          'Une modification d’aspect extérieur relève en général de la déclaration préalable ; une extension au-delà d’un certain seuil de surface relève du permis de construire. Les seuils dépendent du plan local d’urbanisme de votre commune. Nous identifions le régime applicable à la visite et préparons les pièces du dossier.',
      },
      {
        question: 'Peut-on étaler les travaux en plusieurs phases ?',
        reponse:
          'Oui, et c’est parfois la bonne décision quand le budget doit être lissé. Nous découpons alors le projet en lots cohérents, en gardant à l’esprit qu’un lot mal choisi oblige à revenir sur ce qui vient d’être fait. Le devis précise ce qui doit impérativement être traité ensemble.',
      },
    ],
  },

  'renovation-studio': {
    resume:
      'Rénovation de studio et de petite surface : optimisation des volumes, rangements sur mesure et remise à neuf complète, pour habiter comme pour louer.',
    intro: [
      'Sur une petite surface, chaque décision compte double. Un mètre carré gagné sur un couloir change l’usage quotidien du logement, et une erreur d’implantation ne se rattrape pas. Nous travaillons donc les plans avant de toucher au bâti.',
      'Pour un investissement locatif, l’équation est aussi celle du délai : chaque semaine de chantier est une semaine sans loyer. Nous calons un planning serré et vous prévenons le jour même si un imprévu le remet en cause.',
    ],
    prestations: [
      'Étude d’implantation et optimisation de la distribution',
      'Création de rangements sur mesure et de mezzanines',
      'Kitchenette compacte, du réseau à la pose',
      'Salle d’eau complète sur petite surface',
      'Reprise de l’électricité et mise aux normes',
      'Sols, peinture et finitions',
    ],
    faq: [
      {
        question: 'Combien de temps prend la rénovation d’un studio ?',
        reponse:
          'Cela dépend de l’ampleur : une remise en état avec peinture et sols se compte en semaines, une rénovation complète avec reprise des réseaux et création d’une salle d’eau demande sensiblement plus. Le planning exact figure dans le devis, établi après le relevé — nous n’annonçons pas de durée avant d’avoir vu le logement.',
      },
      {
        question: 'Peut-on créer une salle d’eau là où il n’y en a pas ?',
        reponse:
          'Techniquement souvent oui, à condition de raccorder l’évacuation à une chute existante avec une pente suffisante. Quand la distance est trop grande, un broyeur sanitaire est une solution, avec ses contraintes d’entretien. Nous vérifions la faisabilité au relevé.',
      },
      {
        question: 'Travaillez-vous pour des propriétaires bailleurs ?',
        reponse:
          'Oui. Nous adaptons alors les choix de matériaux à un usage locatif — la résistance et la facilité de remise en état priment sur l’effet visuel — et nous fournissons les justificatifs nécessaires à votre comptabilité.',
      },
    ],
  },

  'renovation-salle-de-bain': {
    resume:
      'Rénovation de salle de bain, de la dépose à la pose : douche à l’italienne, adaptation PMR, plomberie neuve et étanchéité réalisée dans les règles.',
    intro: [
      'Une salle de bain concentre plus de contraintes techniques que n’importe quelle autre pièce : étanchéité, pentes d’évacuation, ventilation, sécurité électrique. C’est aussi la pièce où un défaut d’exécution se voit le plus vite — et coûte le plus cher à reprendre.',
      'Nous traitons l’étanchéité sous carrelage comme un poste à part entière, pas comme une option. C’est ce qui sépare une douche à l’italienne qui tient dix ans d’un sinistre à reprendre entièrement au bout de deux hivers.',
    ],
    prestations: [
      'Dépose complète et évacuation de l’ancienne salle de bain',
      'Reprise des alimentations et des évacuations',
      'Système d’étanchéité liquide sous carrelage',
      'Douche à l’italienne, receveur extra-plat ou baignoire',
      'Adaptation PMR : barres d’appui, seuil nul, espace de rotation',
      'Ventilation mécanique et sécurité électrique des volumes',
      'Carrelage, faïence, meubles et robinetterie',
    ],
    faq: [
      {
        question: 'Qu’est-ce qui garantit l’étanchéité d’une douche à l’italienne ?',
        reponse:
          'Le carrelage et les joints ne sont pas étanches : ils laissent passer l’humidité. L’étanchéité vient d’un système appliqué sous le carrelage, avec des bandes de renfort dans les angles et autour des évacuations. C’est invisible une fois terminé, et c’est pourtant le poste qui détermine la durée de vie de l’ouvrage.',
      },
      {
        question: 'Peut-on déplacer la douche ou les WC ?',
        reponse:
          'Cela dépend de la position de la chute d’évacuation et de la pente disponible. Un déplacement de quelques dizaines de centimètres passe souvent ; au-delà, il faut surélever le sol ou recourir à une pompe de relevage. Nous mesurons la contrainte au relevé et vous donnons les options chiffrées.',
      },
      {
        question: 'Réalisez-vous des salles de bain adaptées à la perte d’autonomie ?',
        reponse:
          'Oui : douche de plain-pied sans ressaut, sol antidérapant, barres d’appui fixées dans un support renforcé, espace de manœuvre pour un fauteuil et hauteurs adaptées. Ces aménagements se conçoivent dès le plan, pas en fin de chantier.',
      },
    ],
  },

  'renovation-cuisine': {
    resume:
      'Rénovation de cuisine : ouverture sur le séjour, reprise des réseaux, pose du mobilier et finitions. De la dépose de l’ancienne cuisine à la mise en service des appareils.',
    intro: [
      'Ouvrir une cuisine sur le séjour change l’usage d’un logement entier. C’est aussi l’occasion de reprendre des réseaux souvent sous-dimensionnés : une cuisine contemporaine demande des circuits électriques dédiés que les installations anciennes n’ont pas.',
      'Nous coordonnons la pose du mobilier avec les corps de métier qui interviennent avant : l’électricien et le plombier doivent savoir où arrivera chaque appareil. C’est cette coordination, plus que la pose elle-même, qui évite les reprises.',
    ],
    prestations: [
      'Dépose de l’ancienne cuisine et évacuation',
      'Ouverture de cloison, avec étude de structure si le mur est porteur',
      'Circuits électriques dédiés et mise aux normes',
      'Alimentation et évacuation pour évier et lave-vaisselle',
      'Pose du mobilier et des plans de travail',
      'Crédence, carrelage et peinture',
      'Raccordement et mise en service des appareils',
    ],
    faq: [
      {
        question: 'Posez-vous les cuisines achetées en magasin ?',
        reponse:
          'Oui. Nous réalisons les travaux préparatoires — réseaux, sol, murs — puis la pose du mobilier que vous avez choisi. Nous vous demandons le plan de la cuisine avant le démarrage : il détermine la position exacte des arrivées et des attentes électriques.',
      },
      {
        question: 'Combien de circuits électriques faut-il dans une cuisine ?',
        reponse:
          'La norme NF C 15-100 impose des circuits spécialisés pour les gros appareils et un nombre minimal de prises réparties sur le plan de travail. Une installation ancienne est presque toujours en deçà. La mise en conformité figure en poste distinct dans le devis.',
      },
      {
        question: 'Peut-on ouvrir la cuisine sur le séjour sans tout refaire ?',
        reponse:
          'Souvent oui, mais l’ouverture révèle les différences de niveau et de revêtement entre les deux pièces. Nous le signalons avant, avec le coût du raccord de sol, plutôt que de le présenter comme un supplément en cours de chantier.',
      },
    ],
  },

  'pose-carrelage': {
    resume:
      'Pose de carrelage au sol et au mur : préparation du support, ragréage, grands formats et finitions. Le résultat se joue sous le carreau autant que dessus.',
    intro: [
      'Un carrelage se juge à la planéité du support et à la régularité des joints. Un sol mal ragréé produit des carreaux qui sonnent creux et des angles qui se décollent ; aucune qualité de carreau ne rattrape cela.',
      'Nous traitons donc la préparation comme un poste chiffré à part : dépose, reprise du support, primaire, ragréage. Vous savez ce que coûte le travail invisible, et pourquoi il est là.',
    ],
    prestations: [
      'Dépose de l’ancien revêtement et évacuation',
      'Reprise du support, primaire d’accrochage et ragréage',
      'Pose droite, en diagonale, à joints décalés ou en chevrons',
      'Grands formats et carreaux rectifiés',
      'Faïence murale et crédences',
      'Plinthes, profilés de finition et joints',
    ],
    faq: [
      {
        question: 'Peut-on carreler par-dessus un carrelage existant ?',
        reponse:
          'C’est possible si l’ancien carrelage est parfaitement adhérent, plan et correctement dégraissé, avec un primaire adapté. Cela évite une dépose salissante, mais surélève le sol de quelques centimètres — ce qui a des conséquences sur les portes et les seuils. Nous vérifions l’adhérence avant de le proposer.',
      },
      {
        question: 'Qu’est-ce qu’un ragréage et quand est-il nécessaire ?',
        reponse:
          'C’est un mortier autolissant coulé sur le sol pour le rendre plan. Il devient nécessaire dès que les écarts dépassent quelques millimètres sous la règle, ce qui est fréquent dans l’ancien. Sans lui, les grands formats en particulier ne peuvent pas être posés correctement.',
      },
      {
        question: 'Quel délai avant de pouvoir marcher sur le carrelage ?',
        reponse:
          'Le délai dépend de la colle et des conditions de température et d’humidité ; il se compte en heures pour la circulation légère et en jours avant la mise en charge complète et le jointoiement. Le planning du chantier intègre ces temps de séchage, ils ne sont pas compressibles.',
      },
    ],
  },

  parquet: {
    resume:
      'Pose, ponçage et vitrification de parquet. Nous posons du massif et du contrecollé, et nous remettons à neuf les parquets anciens plutôt que de les remplacer quand ils peuvent être sauvés.',
    intro: [
      'Un parquet ancien a souvent plus de valeur que ce qui le remplacerait. Avant de proposer une dépose, nous regardons l’épaisseur de la couche d’usure restante : tant qu’elle permet un ponçage, le plancher d’origine peut retrouver son aspect pour une fraction du coût d’un neuf.',
      'Le ponçage se fait en plusieurs passes de grain décroissant, suivies d’un dépoussiérage soigné. La finition — vitrification ou huile — se choisit selon l’usage de la pièce et l’entretien que vous êtes prêt à assurer.',
    ],
    prestations: [
      'Pose de parquet massif, contrecollé et stratifié',
      'Pose clouée, collée ou flottante selon le support',
      'Ponçage de parquets anciens en passes successives',
      'Rebouchage, remplacement de lames abîmées',
      'Vitrification mate, satinée ou brillante',
      'Finition à l’huile ou à la cire',
      'Plinthes et barres de seuil',
    ],
    faq: [
      {
        question: 'Mon parquet ancien peut-il être poncé ?',
        reponse:
          'Tout dépend de l’épaisseur de bois restante au-dessus des clous ou de la languette. Un parquet massif accepte plusieurs ponçages au cours de sa vie ; un contrecollé à couche d’usure fine, un seul, parfois aucun. Nous mesurons avant de nous engager.',
      },
      {
        question: 'Vitrification ou huile : que choisir ?',
        reponse:
          'La vitrification forme un film protecteur, résiste bien au passage et s’entretient facilement, mais une reprise localisée est difficile. L’huile pénètre le bois, se répare par zone et donne un aspect plus mat, au prix d’un entretien régulier. Le choix dépend surtout de la pièce et de vos habitudes.',
      },
      {
        question: 'Peut-on occuper le logement pendant le ponçage ?',
        reponse:
          'Le ponçage est bruyant et produit de la poussière, même avec aspiration à la source ; les produits de finition dégagent des odeurs pendant leur séchage. Nous recommandons de libérer les pièces concernées pendant l’opération et le temps de séchage indiqué dans le devis.',
      },
    ],
  },

  electricite: {
    resume:
      'Travaux d’électricité en rénovation : mise aux normes NF C 15-100, remplacement de tableau, création de circuits et reprise complète de l’installation.',
    intro: [
      'Une installation ancienne n’est pas seulement insuffisante : elle est parfois dangereuse. Absence de liaison équipotentielle dans la salle de bain, circuits sans protection différentielle, conducteurs sous-dimensionnés — ce sont des défauts invisibles jusqu’à l’incident.',
      'Nous établissons un état des lieux de l’installation avant de chiffrer, et distinguons dans le devis ce qui relève de la sécurité immédiate de ce qui relève du confort. Vous décidez ensuite en connaissance de cause.',
    ],
    prestations: [
      'Diagnostic de l’installation existante',
      'Remplacement du tableau et des protections différentielles',
      'Création et reprise de circuits, en saignée ou en apparent',
      'Mise à la terre et liaison équipotentielle des pièces d’eau',
      'Points lumineux, commandes et prises supplémentaires',
      'Alimentation des appareils spécialisés',
      'Pose de détecteurs de fumée normalisés',
    ],
    faq: [
      {
        question: 'Que dit la norme NF C 15-100 pour un logement rénové ?',
        reponse:
          'Elle fixe le nombre minimal de prises et de points lumineux par pièce, impose des circuits spécialisés pour les gros appareils, une protection différentielle adaptée et des règles strictes dans les volumes de la salle de bain. Une rénovation lourde doit s’y conformer sur la partie touchée.',
      },
      {
        question: 'Faut-il tout refaire ou peut-on intervenir partiellement ?',
        reponse:
          'Une reprise partielle est possible quand le tableau est sain et que les conducteurs existants sont en bon état et correctement dimensionnés. Dans le cas contraire, remplacer seulement une portion revient à greffer du neuf sur un ensemble défaillant. Le diagnostic tranche cette question avant le devis.',
      },
      {
        question: 'Fournissez-vous une attestation de conformité ?',
        reponse:
          'Pour les travaux qui l’exigent — installation neuve ou rénovation totale — une attestation de conformité visée par l’organisme agréé est nécessaire à la mise en service. Nous vous indiquons si votre chantier entre dans ce cadre et prenons en charge la démarche.',
      },
    ],
  },

  peinture: {
    resume:
      'Travaux de peinture intérieure : préparation des supports, enduits, rebouchage et application. La finition dépend de ce qui se passe avant la première couche.',
    intro: [
      'Une peinture se juge en lumière rasante, et c’est là que la préparation se voit. Un mur mal préparé fait ressortir chaque défaut sous l’éclairage du soir, quelle que soit la qualité du produit appliqué par-dessus.',
      'Nous chiffrons la préparation séparément de l’application : rebouchage, enduit, ponçage, impression. C’est la partie la plus longue du travail, et celle qui détermine le résultat final.',
    ],
    prestations: [
      'Protection des sols, du mobilier et des menuiseries',
      'Rebouchage, enduit de lissage et ponçage',
      'Traitement des fissures et des supports dégradés',
      'Couche d’impression adaptée au support',
      'Peinture des murs, plafonds et boiseries',
      'Pose de toile de verre et de papier peint',
      'Nettoyage et remise en état en fin de chantier',
    ],
    faq: [
      {
        question: 'Combien de couches appliquez-vous ?',
        reponse:
          'Une couche d’impression sur support neuf ou repris, puis deux couches de finition. Annoncer une seule couche de finition revient presque toujours à laisser apparaître le support par transparence, surtout lors d’un changement de teinte marqué.',
      },
      {
        question: 'Quelle finition choisir selon les pièces ?',
        reponse:
          'Le mat masque les défauts mais se nettoie mal : il convient aux plafonds et aux chambres. Le satin résiste au lessivage, ce qui le rend adapté aux couloirs, cuisines et salles de bain, mais il souligne les irrégularités du support. Nous en tenons compte dans la préparation.',
      },
      {
        question: 'Les fissures vont-elles réapparaître ?',
        reponse:
          'Une microfissure de surface se traite par rebouchage et enduit. Une fissure structurelle, elle, rouvrira tant que sa cause n’est pas traitée : la reboucher sans diagnostic ne fait que reporter le problème. Nous distinguons les deux avant de chiffrer.',
      },
    ],
  },

  plomberie: {
    resume:
      'Travaux de plomberie en rénovation : alimentation, évacuation, sanitaires et chauffe-eau. Reprise complète des réseaux ou intervention ciblée.',
    intro: [
      'Les réseaux d’eau sont ce qu’on voit le moins et ce qui coûte le plus cher à reprendre après coup. Une canalisation en plomb, un tracé sans regard de visite, une évacuation à pente insuffisante : autant de points à traiter pendant que les cloisons sont ouvertes.',
      'Nous profitons systématiquement d’une rénovation pour vérifier l’état des alimentations et des évacuations existantes, et nous vous signalons ce qui mérite d’être repris maintenant plutôt que dans cinq ans.',
    ],
    prestations: [
      'Remplacement des alimentations en cuivre ou en PER',
      'Reprise des évacuations et rétablissement des pentes',
      'Dépose des canalisations en plomb',
      'Pose de sanitaires, robinetterie et meubles',
      'Installation et raccordement de chauffe-eau',
      'Alimentation des appareils électroménagers',
      'Recherche et réparation de fuites',
    ],
    faq: [
      {
        question: 'Faut-il remplacer les canalisations en plomb ?',
        reponse:
          'Oui. Le plomb est aujourd’hui proscrit pour l’eau destinée à la consommation, et sa présence sur le réseau intérieur est un point que relèvera tout diagnostic. Nous remplaçons le tracé concerné plutôt que de le contourner.',
      },
      {
        question: 'Cuivre ou PER : quelle différence ?',
        reponse:
          'Le cuivre est rigide, durable et se soude ; il donne un réseau propre et durable mais demande plus de temps de pose. Le PER est souple, rapide à mettre en œuvre et bien adapté aux passages en gaine avec alimentation depuis un collecteur. Les deux sont conformes ; le choix dépend de la configuration et du budget.',
      },
      {
        question: 'Intervenez-vous en urgence pour une fuite ?',
        reponse:
          'Notre métier est la rénovation planifiée, pas le dépannage d’urgence. Nous traitons les fuites détectées sur nos chantiers et chez les clients dont nous avons réalisé l’installation, mais nous ne proposons pas d’astreinte : mieux vaut vous le dire clairement que de vous faire attendre.',
      },
    ],
  },
};
