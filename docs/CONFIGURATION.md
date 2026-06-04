# Configuration & initialisation d'Anama — le guide complet (en français)

> Ce document explique **chaque pièce** de la config du projet, et surtout le
> *pourquoi*. Il est écrit pour quelqu'un qui débute sur Docker, Gradle et
> Spring. Le README (en anglais) reste le « mode d'emploi » concis ; ici on
> prend le temps de **comprendre**.

## Sommaire

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Docker : les concepts](#2-docker--les-concepts)
3. [docker-compose : orchestrer les conteneurs](#3-docker-compose--orchestrer-les-conteneurs)
4. [Gradle : construire le backend](#4-gradle--construire-le-backend)
5. [application.yml : configurer Spring](#5-applicationyml--configurer-spring)
6. [Le Makefile : les raccourcis](#6-le-makefile--les-raccourcis)
7. [Le front : Vite, Tailwind, nginx](#7-le-front--vite-tailwind-nginx)
8. [Journal des pièges résolus](#8-journal-des-pièges-résolus)
9. [Mode d'emploi rapide](#9-mode-demploi-rapide)

---

## 1. Vue d'ensemble du projet

Anama est un **monorepo** : le backend et le frontend vivent dans le même dépôt,
côte à côte. Ça simplifie le développement (un seul `git clone`, une seule
config Docker) tant qu'on est une petite équipe.

```
Anama/
├── apps/
│   ├── api/                 → backend Spring Boot (l'API REST, en Java)
│   │   ├── build.gradle         (déclare les dépendances et la version de Java)
│   │   ├── gradlew              (le "wrapper" Gradle, voir §4)
│   │   ├── Dockerfile           (image de PRODUCTION de l'API)
│   │   ├── Dockerfile.dev       (image de DÉVELOPPEMENT de l'API)
│   │   └── src/main/...         (le code Java + application.yml + migrations)
│   └── web/                 → frontend React + TypeScript
│       ├── package.json         (dépendances npm + scripts)
│       ├── vite.config.ts       (config du serveur de dev / build)
│       ├── Dockerfile           (image de PRODUCTION du front)
│       ├── Dockerfile.dev       (image de DÉVELOPPEMENT du front)
│       └── nginx.conf           (sert le front compilé en prod)
├── docker-compose.yml       → décrit les 3 services en mode PROD (base + api + web)
├── docker-compose.dev.yml   → surcharge pour le mode DEV (hot-reload)
├── Makefile                 → raccourcis : `make dev`, `make prod`, etc.
└── docs/CONFIGURATION.md    → ce fichier
```

**Trois briques tournent ensemble** :

| Service | Rôle | Techno |
|---------|------|--------|
| `postgres` | stocke les données (novels, chapitres…) | PostgreSQL 16 |
| `api` | expose l'API REST `/api/...` | Java 21 + Spring Boot |
| `web` | l'interface visible dans le navigateur | React + Vite |

---

## 2. Docker : les concepts

### Pourquoi Docker ?

Sans Docker, ton collègue doit **installer manuellement** la bonne version de
Java, de Node, configurer PostgreSQL… et le moindre écart casse tout (« ça marche
chez moi »). Docker emballe chaque service avec **tout ce dont il a besoin**, si
bien que `make dev` donne le **même environnement** à tout le monde.

### Image vs conteneur

- Une **image** = un modèle figé, en lecture seule (« une recette + les
  ingrédients pré-préparés »). Ex. : l'image `postgres:16`.
- Un **conteneur** = une instance qui tourne, créée à partir d'une image
  (« le plat cuisiné à partir de la recette »).

On construit (`build`) une image une fois, puis on lance (`up`) un ou plusieurs
conteneurs à partir d'elle.

### Le Dockerfile

Un `Dockerfile` est la **recette** d'une image : on part d'une image de base
(`FROM`), on ajoute des fichiers (`COPY`), on exécute des commandes (`RUN`), et on
définit ce qui se lance au démarrage (`CMD` / `ENTRYPOINT`).

### Pourquoi DEUX Dockerfiles par app (`Dockerfile` + `Dockerfile.dev`) ?

Parce que **développer** et **mettre en production** sont deux besoins opposés :

| | DEV (`Dockerfile.dev`) | PROD (`Dockerfile`) |
|---|---|---|
| But | itérer vite, hot-reload | image légère, figée, sûre |
| Code | **monté en volume** (modifs live) | **copié et compilé** dans l'image |
| API | `./gradlew bootRun` | un `.jar` exécuté par un JRE seul |
| Front | serveur de dev Vite | bundle statique servi par **nginx** |

### Le build « multi-stage » (en prod)

Regarde [apps/api/Dockerfile](../apps/api/Dockerfile) : il a **deux étapes**.

1. **Étape `build`** : part d'une image **JDK complet + Gradle** (lourde), copie
   le code et produit le `.jar`.
2. **Étape `runtime`** : part d'une image **JRE seul** (légère) et **ne copie que
   le `.jar`** depuis l'étape 1.

Résultat : l'image finale ne contient ni le JDK, ni Gradle, ni les sources —
juste le strict nécessaire pour exécuter. Image plus petite = plus rapide à
déployer et surface d'attaque réduite. Même principe côté front : on build avec
Node, mais l'image finale ne contient que **nginx + les fichiers compilés**.

### Le réseau Docker : `postgres:5432` vs `localhost:5433`

Quand on lance plusieurs conteneurs avec docker-compose, ils sont placés sur un
**réseau privé** où chacun est joignable **par le nom de son service**. C'est
pour ça que l'API, *à l'intérieur* de Docker, se connecte à la base via
`postgres:5432` (le nom du service `postgres`, sur son port **interne** 5432).

Mais **depuis ta machine** (hors Docker), ce réseau privé n'existe pas : tu
passes par le port **exposé** `5433`. D'où la règle :

- Hors Docker (ex. un client SQL sur ta machine) → `localhost:5433`
- Dans Docker (l'API qui parle à la base) → `postgres:5432`

C'est exactement ce que gère la datasource paramétrable (voir §5).

### Les volumes

Un conteneur est **éphémère** : quand on le supprime, tout ce qu'il contenait
disparaît. Un **volume** est un espace de stockage qui **survit** au conteneur.
On en utilise trois sortes ici :

- `postgres_data` → **persiste la base** (sinon on perdrait toutes les données à
  chaque `make down`).
- `./apps/api:/app` et `./apps/web:/app` (en dev) → **monte ton code** dans le
  conteneur, donc tes modifications sont visibles immédiatement (hot-reload).
- `gradle_cache` et le volume anonyme `node_modules` → **cachent les
  dépendances** pour ne pas les re-télécharger à chaque démarrage.

---

## 3. docker-compose : orchestrer les conteneurs

Lancer 3 conteneurs à la main (avec les bons ports, variables, dépendances)
serait pénible. **docker-compose** décrit tout ça dans un fichier et lance le
tout en une commande.

### Deux fichiers : base (prod) + surcharge (dev)

- [docker-compose.yml](../docker-compose.yml) = le fichier **de base**, qui décrit
  les 3 services en mode **production**.
- [docker-compose.dev.yml](../docker-compose.dev.yml) = une **surcharge** qui
  vient *par-dessus* et **ajoute** seulement ce qui change en dev (les
  `Dockerfile.dev`, les volumes de code, le polling Vite).

On combine les deux ainsi :

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

(c'est ce que `make dev` fait pour toi). Avantage : **zéro duplication** — la
config commune n'est écrite qu'une fois.

### `depends_on` + `healthcheck` : démarrer dans le bon ordre

L'API a besoin que la base soit **réellement prête** (pas juste « démarrée »).
Le service `postgres` définit un `healthcheck` (`pg_isready`) qui teste vraiment
la base, et l'API déclare :

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

→ Docker ne démarre l'API qu'une fois la base **saine**. Ça évite l'erreur
classique « connection refused » au démarrage.

### Pourquoi le format `version: "2.4"` ?

Sur cette machine, l'outil installé est `docker-compose` **v1** (avec le tiret).
La condition `service_healthy` dans `depends_on` n'est supportée, en v1, que par
le **format de fichier `2.x`** (elle a été retirée du format `3.x`). On choisit
donc `2.4`, pleinement compatible avec notre outil et qui gère toutes nos
fonctionnalités (build, volumes, healthcheck, depends_on conditionnel).

### Le mapping de ports `5173:80` (et pourquoi le même dans les 2 modes)

Le front est exposé sur le port **5173 de ta machine** dans les deux modes :

- en prod, nginx écoute le port 80 *dans* le conteneur → `"5173:80"` ;
- en dev, Vite est lancé avec `--port 80` *dans* le conteneur → `"5173:80"` aussi.

Pourquoi se forcer à toujours sortir sur 5173 ? Parce que l'API n'autorise le
**CORS** que pour l'origine `http://localhost:5173` (voir `CorsConfig`). En
gardant la même origine dans les deux modes, on évite de reconfigurer le CORS.

---

## 4. Gradle : construire le backend

Gradle est l'outil qui **compile** le code Java, **télécharge les dépendances**
et **lance** l'application. (On a délibérément choisi Gradle, pas Maven.)

### Le wrapper (`./gradlew`)

Tu remarqueras qu'on écrit `./gradlew` et pas `gradle`. Le **wrapper** est un
petit script versionné dans le dépôt qui **télécharge et lance automatiquement
la bonne version de Gradle**. Personne n'a besoin d'installer Gradle à la main :
tout le monde utilise exactement la même version. La version visée est inscrite
dans `gradle/wrapper/gradle-wrapper.properties`.

### Pourquoi Gradle 8.14 (et pas 9.x) ?

Spring Boot 4 supporte les deux. Mais l'extension Java de VS Code (son
« Gradle Build Server ») n'arrivait pas à importer un projet en Gradle 9.5.1 →
tout le projet s'affichait en **rouge** dans l'IDE alors que la compilation en
ligne de commande marchait. En **figeant le wrapper sur 8.14**, l'import VS Code
fonctionne. (Voir aussi §8.)

### `build.gradle` décortiqué

Le fichier [apps/api/build.gradle](../apps/api/build.gradle) :

```gradle
plugins {
    id 'java'                                      // projet Java standard
    id 'org.springframework.boot' version '4.0.6'  // ajoute bootRun, bootJar…
    id 'io.spring.dependency-management' ...        // gère les versions des deps Spring
}

java {
    toolchain { languageVersion = JavaLanguageVersion.of(21) }  // on cible Java 21
}

dependencies {
    implementation '...starter-data-jpa'      // JPA / Hibernate (objets ↔ base)
    implementation '...starter-validation'     // validation des entrées
    implementation '...starter-webmvc'         // serveur web + REST
    developmentOnly '...spring-boot-devtools'  // redémarrage auto en dev (exclu de la prod)
    runtimeOnly 'org.postgresql:postgresql'    // le driver pour parler à PostgreSQL
    testImplementation '...'                   // dépendances utilisées seulement par les tests
}
```

- `implementation` = dépendance nécessaire pour compiler **et** exécuter.
- `runtimeOnly` = nécessaire seulement à l'exécution (le driver Postgres : le
  code ne l'appelle jamais directement, Spring s'en sert en coulisses).
- `developmentOnly` = présent en dev, **exclu du `.jar` de prod** (devtools).
- `testImplementation` / `testRuntimeOnly` = uniquement pour les tests.

### `bootRun` (dev) vs `bootJar` (prod)

- `./gradlew bootRun` → **compile et lance** l'app directement. Pratique en dev
  (c'est ce que fait `Dockerfile.dev`).
- `./gradlew bootJar` → **produit un `.jar` exécutable** autonome (qui contient
  Tomcat embarqué). C'est ce qu'on met en prod, lancé par `java -jar app.jar`
  (voir l'étape 2 du `Dockerfile`).

---

## 5. application.yml : configurer Spring

Fichier [apps/api/src/main/resources/application.yml](../apps/api/src/main/resources/application.yml).

### Datasource paramétrable

```yaml
datasource:
  url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5433}/anama
  username: ${DB_USER:anama}
  password: ${DB_PASSWORD:anama}
```

La syntaxe `${VAR:défaut}` veut dire : « utilise la variable d'environnement
`VAR` si elle existe, sinon prends `défaut` ». Donc :

- **En local** (pas de variable définie) → `localhost:5433`.
- **Dans Docker** → docker-compose injecte `DB_HOST=postgres` et `DB_PORT=5432`,
  et l'API se connecte au conteneur `postgres`.

Aucun secret n'est codé en dur dans le code : c'est une bonne habitude pro.

### `ddl-auto: none` + scripts SQL d'init

```yaml
jpa:
  hibernate:
    ddl-auto: none
```

C'est **le** point d'architecture à retenir :

- **Le schéma est géré à la main**, en SQL simple, dans les fichiers `.sql` du
  dossier [`db/init/`](../db/init/) (à la racine du projet). Postgres les exécute
  automatiquement, **une seule fois**, à la première création de la base (voir le
  montage `/docker-entrypoint-initdb.d` dans `docker-compose.yml`).
- **Hibernate** est en `none` : il ne crée, ne modifie ni ne vérifie le schéma.
  C'est nous qui décidons de tout via le SQL.

Pourquoi pas `ddl-auto: update` (où Hibernate modifie la base tout seul) ? Parce
que c'est imprévisible et non reproductible. En écrivant nous-mêmes le SQL,
**chaque changement de schéma est un fichier dans Git**, lisible et rejouable.

> Plus tard, quand on aura des entités Java, on pourra repasser en
> `ddl-auto: validate` : Hibernate vérifiera alors que la base (créée par nos
> scripts SQL) correspond bien aux entités, sans jamais la modifier.

> Pour relancer les scripts d'init depuis une base vierge : `make clean` (supprime
> le volume Postgres), puis `make dev` ou `make db`. Les scripts ne se rejouent
> **pas** sur une base déjà existante.

### `open-in-view: false`

Désactive un anti-pattern (« Open Session In View ») qui laisse la connexion à la
base ouverte pendant le rendu de la réponse. On chargera les données
explicitement dans la couche service — plus propre et plus performant.

---

## 6. Le Makefile : les raccourcis

Le [Makefile](../Makefile) évite de retenir les longues commandes docker-compose.
Tape `make <cible>` :

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `make dev` | Lance la stack en **mode dev** (hot-reload), en arrière-plan. |
| `make prod` | Lance les **images de prod** (jar + nginx), en arrière-plan. |
| `make down` | Arrête et supprime les conteneurs. |
| `make logs` | Affiche les logs en continu (Ctrl+C pour arrêter de suivre, **sans** arrêter l'app). |
| `make ps` | Liste l'état des conteneurs. |
| `make db` | Démarre **uniquement** PostgreSQL (utile si on veut lancer l'app à la main). |
| `make restart-api` | Redémarre l'API (applique un changement backend en dev). |
| `make rebuild` | Reconstruit les images dev de zéro (sans cache). |
| `make clean` | Arrête tout **et supprime les volumes** → ⚠️ efface la base. |
| `make help` | Rappelle toutes les commandes. |

Sous le capot, le Makefile combine les bons fichiers compose pour chaque mode
(`-f docker-compose.yml` pour la prod, `+ -f docker-compose.dev.yml` pour le dev).

---

## 7. Le front : Vite, Tailwind, nginx

### Vite (serveur de dev)

Dans [apps/web/vite.config.ts](../apps/web/vite.config.ts) :

- `host: true` → Vite écoute sur `0.0.0.0` (toutes les interfaces). **Obligatoire
  sous WSL2**, sinon le navigateur Windows ne joint pas le serveur (erreur
  `ERR_CONNECTION_RESET`).
- `watch: usePolling` (activé via la variable `VITE_USE_POLLING`) → dans un
  conteneur Docker, les événements de fichiers ne traversent pas toujours le
  volume monté ; le « polling » fait que Vite vérifie les fichiers à intervalle
  régulier pour que le hot-reload se déclenche. Activé **uniquement en Docker**
  (zéro impact en dev natif).

### Les variables d'environnement front

Vite n'expose au code que les variables préfixées par `VITE_`, lues via
`import.meta.env.VITE_...`. On a :

- `.env.development` → utilisé par `npm run dev` (et le mode dev Docker).
- `.env.production` → utilisé par `npm run build` (le bundle de prod).

Les deux pointent vers `VITE_API_URL=http://localhost:8080` : le navigateur (sur
ta machine) joint l'API via le port 8080 exposé par Docker.

### nginx (en prod)

En prod, le front est **compilé** en fichiers statiques (HTML/JS/CSS) servis par
**nginx**, un serveur web minuscule et rapide. Le fichier
[apps/web/nginx.conf](../apps/web/nginx.conf) contient un **SPA fallback** :

```nginx
location / { try_files $uri $uri/ /index.html; }
```

→ toute URL inconnue renvoie `index.html`, indispensable quand on aura plusieurs
pages côté React (ex. `/novels/:id`), car c'est React Router qui gérera la route
côté navigateur.

---

## 8. Journal des pièges résolus

Pour ne pas reperdre du temps dessus plus tard :

- **Port 5433 au lieu de 5432.** Un autre projet (`axioscore-db`) occupe déjà le
  port 5432 sur la machine. On expose donc Postgres sur **5433** côté machine
  (le port interne reste 5432).
- **Erreurs rouges dans l'IDE = PAS un problème Gradle/Spring.** La vraie cause
  était **trois serveurs de langage Java installés en même temps** dans VS Code
  (`redhat.java` = le bon, plus deux parasites `georgewfraser.vscode-javac` et
  `oracle.oracle-java`). Les parasites ne lisent pas le classpath Gradle et
  affichaient de fausses erreurs « package org.springframework does not exist ».
  Solution : désinstaller les deux parasites, garder Red Hat, recharger la
  fenêtre. → Si le rouge revient, **vérifier d'abord les extensions Java** avant
  de toucher à Gradle.
- **WSL2.** Vite doit écouter sur `0.0.0.0` (`host: true`) pour être joignable
  depuis le navigateur Windows.
- **Local ⇄ Docker exclusifs.** On ne peut pas faire tourner l'API en local
  (`bootRun`) **et** dans Docker en même temps : les deux veulent le port 8080
  (et 5173 pour le front). Choisis un mode ; pour passer de l'un à l'autre,
  arrête le premier.

---

## 9. Mode d'emploi rapide

Pré-requis : **Docker** et **make** (rien d'autre — ni Java, ni Node à installer).

```bash
git clone <repo> && cd Anama

make dev      # démarre base + api + web en mode hot-reload
              # → App : http://localhost:5173   API : http://localhost:8080

make logs     # suivre les logs (Ctrl+C pour arrêter de suivre)
make down     # tout arrêter
```

Pour tester comme en production : `make prod`. Pour repartir d'une base vierge :
`make clean` (⚠️ efface les données).

---

*Doc maintenue au fil du projet. Quand on ajoute une brique de config, on
explique ici le *pourquoi*, pas seulement le *comment*.*
