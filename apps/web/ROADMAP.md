# 🗺️ Roadmap fonctionnelle — Novel Realm (front)

> Inventaire **exhaustif** des fonctionnalités qui manquent pour arriver à une application
> de lecture de web-novels vraiment **complète** (type Royal Road / ScribbleHub /
> LightNovelWorld / WebNovel).
>
> Ce document est une **liste d'idées priorisées**, pas un engagement. On coche au fur
> et à mesure. Chaque item indique sa priorité et, si besoin, ce qu'il faut côté back.

## Légende

| Tag | Sens |
|-----|------|
| 🔴 **Cœur** | Indispensable pour se dire « complet » |
| 🟡 **Confort** | Améliore nettement l'expérience |
| 🟢 **Ambition** | Différenciant / plateforme aboutie |
| ⚙️ | Nécessite (ou dépend de) du travail **back** |
| 📌 | Déjà suivi par une **issue** GitHub |

---

## ✅ Déjà en place (rappel)

Pour que la liste « manquant » ait du sens, voici ce qui **existe déjà** :

- **Auth** : inscription, connexion, déconnexion, Google OAuth, sessions par cookie, routes protégées.
- **Catalogue** (`/`) : recherche titre/auteur, filtre par genre + statut, tri (récents / titre / popularité).
- **Détail roman** (`/novels/:id`) : couverture, statut, auteur, résumé, liste des chapitres avec ✓ lus, bouton « Continuer la lecture ».
- **Lecteur** (`/novels/:id/chapters/:id`) : contenu, navigation préc./suivant, « marquer comme lu », **reprise** (sauvegarde + restauration de la position de défilement).
- **Bibliothèque** (`/novels`) : suivre un roman, **étagères/catégories** (créer, renommer, supprimer, ranger un roman via le menu « + »).
- **Progression** : chapitres lus, position de reprise (%), badge « chapitres restants ».
- **Historique** (`/historique`) : liste paginée, tri date/roman, filtre par roman, reprise, purge totale / par roman.
- **Profil** (`/profil`) : infos de compte en lecture seule.

---

## 1. 📖 Lecture & lecteur

Le cœur du produit. C'est là que se joue la rétention.

- 🔴 **Préférences de lecture** : taille de police, interligne, largeur de colonne, choix de police (serif / sans / dyslexie). Persistées côté user. ⚙️
- 🔴 **Thèmes de lecture** : clair / sombre / sépia + réglage de luminosité.
- 🔴 **Table des matières rapide** depuis le lecteur (dropdown/panneau) + **saut à un chapitre** (recherche de chapitre).
- 🔴 **Navigation clavier** dans le lecteur (`←` / `→` chapitre, `j`/`k` défilement).
- 🟡 **Barre de progression de lecture** en haut du chapitre (%) + **temps de lecture estimé** (restant / total).
- 🟡 **Mode immersif / plein écran** : masquer la navbar au scroll, UI minimale.
- 🟡 **Défilement infini inter-chapitres** : charger automatiquement le chapitre suivant en bas de page.
- 🟡 **Mode pagination** (pages « façon liseuse ») en alternative au scroll.
- 🟡 **Marque-pages** dans un chapitre (position nommée, retrouvée plus tard). ⚙️
- 🟢 **Surlignage & notes** personnelles sur des passages. ⚙️
- 🟢 **Synthèse vocale (TTS)** : écouter le chapitre.
- 🟢 **Auto-scroll** à vitesse réglable.
- 🟢 **Illustrations inline** (images dans le contenu) — dépend du format de contenu. ⚙️ 📌 (#16)

---

## 2. 🧭 Découverte & catalogue

- 🔴 **Pagination du catalogue** : aujourd'hui le front demande `size=60` en dur. Brancher la vraie pagination (ou infinite scroll) sur `PageResponse`.
- 🔴 **Page de détail enrichie** : note moyenne, nombre de lecteurs, nombre de chapitres, date de dernière mise à jour, tags. ⚙️
- 🔴 **Accueil éditorialisé** : carrousels « Reprendre la lecture », « Derniers chapitres des romans suivis », « Populaires », « Nouveautés ». ⚙️ 📌 (#14)
- 🟡 **Recherche avancée** : multi-genres (ET/OU), **exclure** des genres, filtre par nombre de chapitres / longueur / année / note minimale.
- 🟡 **Recherche insensible aux accents** (`unaccent`) — repérée comme reportée côté back. ⚙️
- 🟡 **Tris supplémentaires** : mieux notés, tendance (trending), mis à jour récemment, nombre de chapitres. ⚙️
- 🟡 **Romans similaires** sur la page détail + **recommandations** « parce que vous avez lu X ». ⚙️
- 🟡 **Page auteur** (tous les romans d'un auteur) et **pages genre / tag** (landing dédiée).
- 🟡 **Auto-complétion** dans la barre de recherche + **recherches récentes**.
- 🟢 **Classements / leaderboards** (top semaine / mois). ⚙️
- 🟢 **Collections éditoriales** (« à la une », sélections thématiques). ⚙️
- 🟢 **Système de tags** en plus des genres (rechercher, filtrer). ⚙️ 📌 (#16 apparenté)

---

## 3. 📚 Bibliothèque & organisation

- 🔴 **Statuts de lecture dans l'UI** : « en cours / terminé / en pause / abandonné / à lire ». Le back (`LibraryEntry.ReadingStatus`) existe déjà, mais le sélecteur a été retiré → **le réintroduire proprement** (par carte + filtre par statut).
- 🔴 **Tri & filtre de la bibliothèque** : par statut, dernière mise à jour, progression, alphabétique.
- 🟡 **Recherche dans sa bibliothèque**.
- 🟡 **Vue liste ↔ grille** (basculable).
- 🟡 **Badge « nouveaux chapitres »** depuis la dernière visite, par roman. ⚙️
- 🟡 **Favoris / épinglés** (mise en avant en haut).
- 🟢 **Réorganisation drag & drop** dans les étagères (+ ordre personnalisé). ⚙️
- 🟢 **Import / export** de la bibliothèque (JSON / CSV). ⚙️

---

## 4. 🔔 Notifications & suivi des sorties

- 🔴 **Notifications de nouveaux chapitres** pour les romans suivis (cloche in-app + centre de notifications). ⚙️
- 🟡 **Badge « nouveau »** sur les cartes des romans suivis. ⚙️
- 🟡 **Préférences de notification** globales et par roman. ⚙️
- 🟡 **Emails** : nouveau chapitre, résumé hebdo (le back a déjà un `EmailService`). ⚙️
- 🟢 **Web Push** (notifications navigateur, PWA). ⚙️
- 🟢 **Flux d'activité** (« feed ») des romans suivis.

---

## 5. 💬 Social & communauté

- 🔴 **Notes & avis (reviews)** sur les romans : étoiles + texte, note moyenne agrégée. ⚙️
- 🔴 **Commentaires par chapitre**. ⚙️
- 🟡 **Votes / likes** sur romans, chapitres, commentaires. ⚙️
- 🟡 **Balises spoiler** dans les commentaires/avis.
- 🟡 **Signalement de contenu** (commentaire, avis) → file de modération. ⚙️
- 🟢 **Commentaires inline par paragraphe** (façon Wattpad). ⚙️
- 🟢 **Profils publics** + **suivre d'autres lecteurs**. ⚙️
- 🟢 **Listes de lecture publiques** partageables. ⚙️
- 🟢 **Partage** (lien, réseaux sociaux, carte OpenGraph par roman).
- 🟢 **Forums / discussions** par roman. ⚙️

---

## 6. 👤 Compte & profil

- 🔴 **Édition du profil** : pseudo, bio, **avatar** (upload). ⚙️
- 🔴 **Changer le mot de passe**. ⚙️
- 🔴 **Mot de passe oublié / réinitialisation** (par email). ⚙️
- 🔴 **Vérification de l'email** à l'inscription. ⚙️
- 🟡 **Préférences persistées** (thème, langue, réglages de lecture) synchronisées entre appareils. ⚙️
- 🟡 **Suppression de compte** + **export des données** (RGPD). ⚙️
- 🟡 **Sessions actives** : voir / révoquer les connexions. ⚙️
- 🟢 **Statistiques de lecture** : chapitres lus, temps passé, séries (streaks), rythme. ⚙️ *(hors scope #15, mais logique suite de l'historique)*
- 🟢 **Gamification** : badges, niveaux, objectifs de lecture.
- 🟢 **Double authentification (2FA)**. ⚙️

---

## 7. ✍️ Création & publication *(si on vise une plateforme d'auteurs)*

- 🟢 **Espace auteur** : publier un roman, éditeur de chapitres (markdown/riche). ⚙️
- 🟢 **Brouillons + programmation** de publication. ⚙️
- 🟢 **Tableau de bord auteur** : vues, lecteurs, abonnés, revenus. ⚙️
- 🟢 **Monétisation** : chapitres premium, pourboires, abonnements. ⚙️

---

## 8. 🛠️ Administration & modération

- 🟡 **Rôles & permissions** (admin / modérateur / lecteur). ⚙️
- 🟡 **Back-office admin** : gérer romans, genres, tags, utilisateurs. ⚙️
- 🟡 **Déclencher / suivre l'ingestion** depuis l'UI (scraping LightNovelWorld). ⚙️
- 🟢 **File de modération** (commentaires, avis, signalements). ⚙️
- 🟢 **Analytics** : tableau de bord d'usage (lecteurs, romans populaires). ⚙️

---

## 9. 🧱 Contenu & modèle de données ⚙️ 📌

Fondations qui débloquent plusieurs features ci-dessus.

- 🔴 **Tomes / volumes** : regrouper les chapitres en volumes. 📌 (#16)
- 🔴 **Contenu riche & format** : markdown/HTML, notes d'auteur, images. 📌 (#16)
- 🟡 **Tags**, **métadonnées source** (langue d'origine, année, traducteur, URL source). 📌 (#17 en partie)
- 🟡 **Fondations données** : migrations Flyway, colonnes d'audit (`created_by`, `updated_at`…). 📌 (#17)
- 🟢 **Chapitres verrouillés / premium** (accès conditionnel).

---

## 10. ♿ Qualité, accessibilité & i18n

- 🔴 **Feedback des actions** : système de **toasts** global (succès/erreur) — aujourd'hui les erreurs sont surtout inline.
- 🔴 **Page 404 dédiée** (aujourd'hui toute route inconnue redirige vers l'accueil) + **error boundary** (page d'erreur propre).
- 🔴 **Accessibilité (a11y)** : focus visibles partout, ARIA sur menus/modales, navigation clavier complète, contrastes.
- 🟡 **Internationalisation (i18n)** : FR/EN, sélecteur de langue (l'app est 100 % FR en dur aujourd'hui).
- 🟡 **Toggle de thème** clair/sombre côté utilisateur (le design gère le sombre, mais pas de bascule exposée).
- 🟡 **États de chargement cohérents** : skeletons partout (déjà partiellement fait), pas de « saut » de layout.
- 🟢 **PWA / hors-ligne** : installable, service worker, **lecture des chapitres suivis en offline**. ⚙️
- 🟢 **SEO** des pages publiques (landing, pages roman) : meta/OpenGraph, éventuel SSR.

---

## 11. ⚡ Fondations techniques front (DX / robustesse)

Pas des « features utilisateur », mais ce qui rend tout le reste plus simple et fiable.

- 🔴 **Cache & data-fetching** : adopter **TanStack Query** (cache, revalidation, retry, invalidation, `isLoading`/`isError`). Aujourd'hui chaque hook refait un `fetch` manuel avec `useEffect` + drapeau `active`.
- 🟡 **Mises à jour optimistes** (biblio, progression, « marquer lu ») pour une UI instantanée.
- 🟡 **Composant de confirmation réutilisable** (généraliser la modale de purge de l'historique).
- 🟡 **Footer** + pages légales (mentions, confidentialité, CGU).
- 🟢 **Tests** : unitaires (Vitest) sur les hooks/services + **e2e** (Playwright) sur les parcours clés.
- 🟢 **Storybook** pour le design system (`components/ui`).
- 🟢 **Gestion fine des erreurs réseau** : retry, mode hors-ligne, bannière « connexion perdue ».

---

## 🎯 Prochaines étapes recommandées (proposition d'ordre)

Un chemin pragmatique pour maximiser l'effet « produit complet » :

1. **Accueil éditorialisé** (reprise + derniers chapitres suivis) — 📌 #14, déjà cadré côté back.
2. **Statuts de lecture dans la bibliothèque** (réactiver le back existant) + **tri/filtre biblio**.
3. **Préférences de lecture** (police, taille, thème, largeur) + **table des matières** dans le lecteur.
4. **Toasts + page 404 + error boundary** (petits, gros impact perçu).
5. **Notes/avis + commentaires par chapitre** (première brique sociale). ⚙️
6. **Notifications de nouveaux chapitres** pour les romans suivis. ⚙️
7. **Édition du profil + avatar + mot de passe oublié**. ⚙️
8. **Tomes/volumes & contenu riche** (débloque le lecteur avancé). 📌 #16
9. **TanStack Query** en refactor transverse quand le nombre d'écrans grossit.

> 💡 Les items marqués ⚙️ demandent d'abord (ou en parallèle) un endpoint côté back.
> Les items 📌 sont déjà tracés sur le board GitHub (#14, #16, #17).
