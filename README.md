# Bellco Rénovation — site web

Site de Bellco Rénovation, entreprise de rénovation tous corps d'état à
Saint-Denis (93210). Reconstruction complète, en remplacement d'un site
WordPress compromis. Aucun code de l'ancien site n'a été repris.

**Production :** https://bellcorenovation.com

---

## Sommaire

- [Pile technique](#pile-technique)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes](#commandes)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)
- [Ajouter du contenu dans le Studio](#ajouter-du-contenu-dans-le-studio) ← pour M. Assim
- [Points de vigilance](#points-de-vigilance)

---

## Pile technique

| Rôle | Choix |
|---|---|
| Framework | Astro 7, sortie statique |
| Rendu à la demande | Uniquement `/api/devis/` et `/api/contact/` |
| Styles | Tailwind CSS 4, jetons dans `src/styles/tokens.css` |
| CMS | Sanity 6, Studio intégré à `/studio/` |
| Hébergement | Cloudflare Pages |
| Validation | Zod 4, schéma partagé client et serveur |
| E-mail | Resend |
| Anti-robot | Cloudflare Turnstile |
| Interactivité | React, sur deux îlots seulement |

Les pages de contenu ne chargent **aucun fichier JavaScript externe** :
environ 1,7 Ko en ligne pour l'en-tête et le bandeau de consentement. React
n'est chargé que sur `/devis/`, `/contact/` et les fiches de réalisation.

---

## Installation

Node 22.12 ou plus récent est requis.

```bash
git clone <dépôt> bellco
cd bellco
npm install
cp .env.example .env    # puis renseigner les variables, voir ci-dessous
npm run dev             # http://localhost:4321
```

Sans projet Sanity configuré, le site se construit quand même : les contenus
issus du CMS sont simplement vides, et un avertissement le signale dans la
console. C'est volontaire — on peut travailler la mise en page sans attendre
que le CMS soit rempli.

---

## Variables d'environnement

Copier `.env.example` vers `.env`. Les variables préfixées `PUBLIC_` sont
visibles dans le navigateur ; les autres restent côté serveur.

| Variable | Rôle | Sans elle |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Identifiant du projet Sanity | Contenus CMS vides |
| `PUBLIC_SANITY_DATASET` | Jeu de données (`production`) | — |
| `SANITY_READ_TOKEN` | Jeton de lecture, si le dataset est privé | Contenus vides |
| `RESEND_API_KEY` | Envoi des e-mails de formulaire | **Formulaires en panne** (503) |
| `DEVIS_FROM_EMAIL` | Adresse expéditrice vérifiée chez Resend | **Formulaires en panne** |
| `DEVIS_TO_EMAIL` | Destinataire des demandes | Repli sur `contact@bellcorenovation.com` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clé publique anti-robot | Widget masqué |
| `TURNSTILE_SECRET_KEY` | Clé privée, vérification serveur | **Protection anti-robot inactive** |

> Les deux variables Resend sont les seules dont l'absence casse une
> fonctionnalité visible. Le formulaire affiche alors un message qui invite à
> téléphoner, plutôt qu'une erreur technique — mais aucune demande n'arrive.

---

## Commandes

```bash
npm run dev        # serveur de développement
npm run build      # construction de production dans dist/
npm run preview    # prévisualisation de la construction
npm run check      # typage TypeScript et Astro
npm run audit      # contrôle du site construit (voir plus bas)
npm run verify     # tests de schéma + typage + build + audit
```

`npm run verify` est la commande à lancer avant tout déploiement. Elle
échoue, avec un code de sortie non nul, si :

- un cas limite du schéma de formulaire régresse ;
- un message de validation remonte en anglais ;
- une page n'a pas exactement un H1, ou perd son titre, sa description ou sa
  canonique ;
- deux pages partagent le même titre ou la même description ;
- une image sort sans texte alternatif ;
- un lien interne pointe vers une page inexistante ;
- une redirection de l'ancien site manque, vise la mauvaise cible ou dégrade
  un 410 en 301 ;
- le Studio redevient indexable ;
- une trace de l'ancien prestataire réapparaît dans le code.

---

## Déploiement

Le site cible **Vercel** par défaut, et sait aussi se construire pour
**Cloudflare Pages**. Les formats de sortie des deux plateformes sont
incompatibles : on choisit donc la cible au build, via `DEPLOY_TARGET`.

```bash
npm run build                          # Vercel (défaut) → .vercel/output/
DEPLOY_TARGET=cloudflare npm run build # Cloudflare      → dist/
```

### Vercel

1. Importer le dépôt dans Vercel. Le préréglage Astro est détecté seul ;
   laisser la commande de build et le répertoire de sortie par défaut.
2. Renseigner les variables d'environnement (**Settings → Environment
   Variables**), pour *Production* **et** *Preview*. Marquer comme secrètes
   toutes celles qui ne commencent pas par `PUBLIC_`.
3. Fixer Node 22 dans **Settings → General → Node.js Version**.
4. Rattacher le domaine `bellcorenovation.com`.

Ce que l'adaptateur produit tout seul, sans configuration : la barre oblique
finale (308), le cache immuable sur `/_astro/*`, et une fonction serverless
unique servant `/api/devis/`, `/api/contact/` et les trois routes 410.

`vercel.json` ne contient qu'une chose : l'en-tête `X-Robots-Tag` sur
`/studio/*`.

### Cloudflare Pages

1. Commande de build : `DEPLOY_TARGET=cloudflare npm run build`.
   Répertoire de sortie : `dist`.
2. Mêmes variables d'environnement.

`public/_headers` s'applique ici ; `vercel.json` y est ignoré. L'adaptateur
écrit `dist/client/_redirects` à partir des redirections déclarées dans
`astro.config.mjs`.

### Redirections et pages de spam

Les douze anciennes adresses sont déclarées **une seule fois**, dans
`astro.config.mjs`. Chaque adaptateur les compile dans son propre format —
rien à maintenir en double.

Les trois pages de spam issues de la compromission ne sont pas des
redirections : aucune plateforme ne sait renvoyer un 410 depuis sa
configuration. Ce sont des routes rendues à la demande, dans `src/pages/`,
qui posent elles-mêmes le statut 410.

> **Piège.** Ne déclarez jamais une redirection d'une adresse vers sa propre
> version avec barre finale (`'/blog': '/blog/'`). Astro considère alors que
> la redirection possède la route et **supprime la page réelle** : `/blog/`
> renvoie 404. `trailingSlash: 'always'` s'en charge déjà, en 308.

### Après la première mise en ligne

- Vérifier que `/studio/` demande une connexion et renvoie bien
  `X-Robots-Tag: noindex` : `curl -I https://bellcorenovation.com/studio/`.
  Si l'en-tête est absent, `vercel.json` n'est pas pris en compte à côté de la
  Build Output API — `robots.txt` reste alors la seule protection, ce qui
  empêche l'exploration mais pas l'indexation d'une URL découverte ailleurs.
- Contrôler une ancienne adresse : `curl -I https://bellcorenovation.com/bellcoelect`
  doit renvoyer 301.
- Contrôler une adresse de spam : `curl -I https://bellcorenovation.com/valorant-hack`
  doit finir en 410.
- Soumettre `sitemap-index.xml` dans la Search Console.
- Envoyer une vraie demande de devis et vérifier sa réception.

---

## Structure du projet

```
src/
├─ components/
│  ├─ blocks/     Sections de page (hero, services, FAQ, témoignages…)
│  ├─ chrome/     En-tête, pied de page, barre mobile, cookies, fil d'Ariane
│  ├─ islands/    Les deux seuls composants React : devis et comparateur
│  └─ media/      Images Sanity, texte riche
├─ content/       Contenus par défaut, écrits en dur (services, communes)
├─ layouts/       Base (le <head>) et Page (Base + chrome)
├─ lib/
│  ├─ sanity/     Client, requêtes GROQ, types, images
│  ├─ schemas/    Schémas Zod partagés client/serveur
│  ├─ seo/        Métadonnées et données structurées
│  ├─ courriel.ts Turnstile et Resend, mutualisés entre les deux endpoints
│  └─ site.ts     Coordonnées, services, communes, lien WhatsApp
├─ pages/         Une page = un fichier, l'arborescence fait les URL
└─ sanity/        Schémas du Studio
scripts/          Contrôles lancés par npm run verify
```

**Contenu par défaut et CMS.** Les dix pages de service et les quatre pages de
commune existent par le plan du site, pas par le CMS : leur texte est écrit
dans `src/content/`. Sanity vient l'enrichir champ par champ — renseigner un
résumé remplace le résumé par défaut sans effacer la FAQ. Conséquence : le
site reste complet même si le CMS est injoignable.

---

## Ajouter du contenu dans le Studio

*Cette section s'adresse à M. Assim. Aucune connaissance technique n'est
nécessaire.*

### Se connecter

Rendez-vous sur **https://bellcorenovation.com/studio/** et connectez-vous
avec le compte qui vous a été créé. Vous arrivez sur une liste : Réalisations,
Articles de blog, Témoignages, Services, Communes, Réglages du site.

Une règle vaut pour tout le Studio : **rien n'est visible sur le site tant que
vous n'avez pas cliqué sur « Publier »**, en bas de l'écran. Vos brouillons
restent privés. Le site se met à jour quelques minutes après la publication.

### Ajouter une réalisation

1. Cliquez sur **Réalisations**, puis sur le bouton **+** en haut de la liste.
2. Remplissez **Titre**. Écrivez-le comme vous le diriez à un client :
   « Appartement haussmannien, rénovation complète ». L'adresse de la page se
   remplit toute seule — cliquez sur « Generate » si elle reste vide.
3. Choisissez le **Type de bien** et la **Commune**. Si la commune n'existe
   pas encore dans la liste, créez-la d'abord dans la rubrique Communes.
4. Indiquez la **Surface** en mètres carrés et la **Durée** en toutes lettres :
   « 11 semaines », « 4 mois ».
5. La **Fourchette de budget** est facultative. Ne la renseignez que si le
   client est d'accord pour qu'elle soit publiée.
6. Dans **Corps de métier**, cochez les métiers réellement intervenus. C'est ce
   qui permet aux visiteurs de filtrer le portfolio, et ce qui fait apparaître
   ce chantier sur les pages de service correspondantes.
7. Onglet **Photos** : déposez la photo « avant » et la photo « après ».
   **Cadrez-les au même endroit** — le site les superpose avec un curseur, et
   l'effet ne fonctionne que si l'angle est identique.
8. **Pour chaque photo, remplissez le texte alternatif.** Le Studio refusera
   d'enregistrer sans. Décrivez ce que montre l'image, en une phrase :
   *« Salle de bain rénovée avec douche à l'italienne et carrelage gris
   clair »*. Ce texte sert aux personnes malvoyantes et à Google. Évitez
   « photo de » ou « image de ».
9. Ajoutez d'autres photos dans la **Galerie** si vous en avez.
10. Rédigez le **Récit du chantier** : ce qui a été fait, ce qui a été
    rencontré, ce qui a été résolu. Trois paragraphes suffisent.
11. Si le client a laissé un mot, recopiez-le dans **Citation du client**.
    Ne publiez que son prénom.
12. Cochez **Mettre en avant sur l'accueil** pour les trois ou quatre plus
    beaux chantiers.
13. Cliquez sur **Publier**.

Vous pouvez laisser l'onglet **Référencement** vide : le site fabrique seul un
titre et une description corrects. Ne le remplissez que si vous voulez une
formulation précise.

### Écrire un article de blog

1. **Articles de blog**, puis **+**.
2. **Titre**, puis **Chapeau** : deux ou trois phrases qui résument l'article.
   C'est ce texte qui s'affiche dans la liste et dans Google.
3. **Image de couverture**, avec son texte alternatif — obligatoire, comme
   partout.
4. Rédigez dans **Article**. La barre d'outils propose :
   *Titre de section* et *Sous-titre* pour découper le texte, *gras*,
   *italique*, listes et liens. La mise en forme du site s'applique
   automatiquement : vous choisissez la structure, pas l'apparence.
5. **Date de publication** : aujourd'hui par défaut. Une date future garde
   l'article invisible jusqu'à cette date.
6. Choisissez une **Catégorie**.
7. **Publier**.

### Renseigner les réglages du site

Ouvrez **Réglages du site**. C'est là que vivent vos coordonnées, vos
horaires, vos réseaux sociaux et vos informations légales.

Deux onglets demandent votre attention :

- **Mentions légales.** SIRET, RCS, TVA, forme juridique, assurance décennale.
  Tant qu'un champ est vide, la page des mentions légales affiche un encadré
  rouge « À COMPLÉTER » bien visible. C'est délibéré : des mentions légales
  incomplètes vous exposent, mieux vaut que cela saute aux yeux.
- **Chiffres et garanties.** Année de création, nombre de chantiers, note
  Google. **Ne remplissez que ce que vous pouvez prouver.** Un champ vide
  n'affiche rien du tout sur le site — c'est préférable à un chiffre approximatif.
  Pour la note Google, recopiez exactement ce qu'affiche votre fiche, le jour
  où vous la saisissez.

### Modifier une page de service

Les dix pages de service fonctionnent déjà sans que vous y touchiez : elles
ont un texte, une liste de prestations et des questions fréquentes.

Dans **Services**, vous pouvez remplacer ce qui ne vous convient pas. Chaque
champ que vous remplissez prend le dessus sur le texte d'origine ; ceux que
vous laissez vides gardent le texte existant. Vous pouvez donc ne changer que
le résumé, sans toucher au reste.

C'est aussi ici que vous ajoutez la **photo principale** de chaque service —
celle qui s'affiche quand quelqu'un partage la page sur les réseaux sociaux.

### En cas de doute

- **Une photo ne s'enregistre pas** → il manque son texte alternatif.
- **Une modification n'apparaît pas sur le site** → avez-vous cliqué sur
  « Publier » ? Attendez ensuite quelques minutes.
- **Vous avez supprimé quelque chose par erreur** → le Studio conserve
  l'historique. Ouvrez le document et cherchez l'icône d'historique en haut à
  droite pour revenir à une version antérieure.
- **Ne modifiez jamais l'adresse d'une page déjà en ligne** (le champ
  « Adresse de la page »). Les liens existants cesseraient de fonctionner et
  la page perdrait son classement dans Google.

---

## Points de vigilance

Choses qui se casseraient silencieusement si on les ignorait.

**Jetons de design.** Toutes les valeurs visuelles vivent dans
`src/styles/tokens.css`. N'écrivez pas de valeur arbitraire dans le markup
(`text-[17px]`, `bg-[#A8452A]`) : si une valeur manque, ajoutez-la aux jetons.
Tailwind 4 ne génère **pas** de variables `--spacing-1`, `--spacing-6` : dans
une feuille de style, écrivez `calc(var(--spacing) * 6)`.

**Contraste sur fond encre.** Sur `--color-primary`, les tons `ink-500`
(2,54:1) et `sand-400` (3,95:1) échouent au critère AA. Les seuls tons de
texte admis sont `sand-300`, `sand-200`, `on-primary` et `accent-on-dark`.
Pour atténuer un libellé sur fond sombre, jouez sur la taille ou la
formulation, pas sur la couleur.

**Barre oblique finale.** Le site est en `trailingSlash: 'always'`. Un appel à
`/api/devis` sans barre finale renvoie 404. Toute nouvelle route d'API doit
être appelée avec sa barre.

**`Astro.clientAddress` est inutilisable.** L'adaptateur Cloudflare ne
l'implémente pas et y accéder lève une exception. L'adresse IP se lit dans
l'en-tête `CF-Connecting-IP` — `ipClient()` dans `src/lib/courriel.ts` s'en
charge.

**Messages de validation.** Zod émet ses messages par défaut en anglais.
Annotez toujours le **type** et pas seulement la contrainte :
`z.string({ error: '…' }).min(2, { error: '…' })`. Le contrôle
`npm run verify` échoue si un message anglais atteint l'utilisateur.

**Styles scopés contre utilitaires Tailwind.** Une règle scopée par Astro
porte un sélecteur d'attribut et l'emporte sur un utilitaire comme
`lg:hidden`. Quand un composant a sa propre feuille de style, gérez-y aussi
ses points de rupture, et placez la règle `@media` **après** la règle de base.

**Textes alternatifs.** Le schéma Sanity les rend obligatoires. Ne contournez
pas cette validation : l'ancien site comptait 39 photos sans alternative
textuelle, et c'est la raison pour laquelle la contrainte est dans le schéma
plutôt que dans une consigne.

**Aucune affirmation invérifiable.** Le site n'annonce ni ancienneté, ni
nombre de chantiers, ni note client tant que ces valeurs ne sont pas saisies
dans les réglages. N'écrivez pas de chiffre en dur dans un composant.

---

## État actuel

Ce qui n'a pas pu être vérifié dans l'environnement de développement, et qui
doit l'être avant la mise en ligne :

- **Envoi réel des formulaires.** Sans `RESEND_API_KEY`, la chaîne s'arrête
  juste avant l'envoi. Les codes de retour sont vérifiés, l'expédition non.
- **Vérification Turnstile.** Sans clés, la protection est inactive et laisse
  passer les requêtes.
- **Contenus Sanity.** Aucune donnée réelle n'a encore traversé le site :
  fiches de réalisation, filtres du portfolio, comparateur avant/après et
  textes alternatifs n'ont jamais tourné sur du contenu véritable.
- **Mesures de performance.** Aucun relevé LCP, CLS ou INP sur mobile bridé.
- **Navigation au clavier de bout en bout.** Les règles de focus sont
  vérifiées dans la feuille de style compilée, mais personne n'a réellement
  parcouru le site à la touche Tab.
