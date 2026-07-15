# Ingestion de romans (scraping LightNovelWorld)

> Comment remplir la base avec de vrais romans (métadonnées + genres + chapitres)
> en les important depuis LightNovelWorld. Tout est en Spring Boot (Jsoup).

## TL;DR

```bash
make ingest SLUG=shadow-slave            # importe le roman + 50 premiers chapitres
make ingest SLUG=shadow-slave MAX=200    # 200 chapitres
```

Le `SLUG` est la partie de l'URL : `https://lightnovelworld.org/novel/`**`shadow-slave`**`/`.

## Ce que ça fait

À partir d'un slug, l'ingestion récupère et enregistre :
- le **roman** (titre, auteur, couverture, statut, résumé),
- ses **genres** (créés s'ils n'existent pas, table `genres` + lien `novel_genre`),
- ses **chapitres** (numéro, titre, contenu), dans la limite de `MAX`.

À la fin, les données sont visibles via l'API existante :
```bash
curl localhost:8080/api/novels              # le roman importé apparaît
curl localhost:8080/api/chapters/novel/<id> # ses chapitres (triés par numéro)
curl localhost:8080/api/genres              # ses genres
```

## Comment ça marche (architecture)

L'ingestion est un **job offline**, jamais dans le chemin d'une requête HTTP.

```
make ingest SLUG=x
   └─ docker compose run --rm (conteneur jetable, profil "ingest")
        └─ IngestionRunner          (actif seulement sous le profil `ingest`)
             └─ NovelIngestionService (orchestre : scrape → mappe → upsert)
                  └─ LightNovelWorldScraper (Jsoup : fetch + parse HTML)
        puis l'app S'ARRÊTE (one-shot) et le conteneur est supprimé (--rm)
```

Points clés :
- **Profil Spring `ingest`** : en fonctionnement normal (`make dev`, profil `dev`), le
  `IngestionRunner` n'existe même pas → **aucun scraping accidentel**, et aucune
  ré-ingestion à chaque redémarrage.
- **One-shot** : le conteneur démarre, importe, puis s'éteint tout seul. Il écrit
  dans la **même base** Postgres que l'app (qui, elle, continue de tourner).
- **Idempotent** : un roman est identifié par son `slug` (colonne unique) ; les
  chapitres déjà présents (même numéro) sont **ignorés**. Relancer la commande
  ne crée pas de doublons et ne re-télécharge pas l'existant — pratique pour
  récupérer la suite d'un roman en cours (`MAX` plus grand au prochain run).

## Paramètres

| Variable | Défaut | Rôle |
|---|---|---|
| `SLUG` | (obligatoire) | identifiant du roman (`.../novel/<slug>/`) |
| `MAX` | `50` | nombre max de chapitres importés (politesse + vitesse) |

Réglage avancé (rarement utile) : `novelrealm.ingestion.delay-ms` (défaut `500`)
= pause entre deux requêtes chapitre, pour ne pas marteler le site.

## Où se trouve le code

```
apps/api/src/main/java/com/novelrealm/ingestion/
├── LightNovelWorldScraper   ← sélecteurs HTML (à adapter ici si le site change)
├── NovelIngestionService    ← scrape → upsert idempotent
├── IngestionRunner          ← déclencheur (profil `ingest`, one-shot)
└── Scraped{Novel,ChapterRef,Chapter}  ← données brutes
```

Si un champ ressort vide, c'est un **sélecteur** à ajuster dans
`LightNovelWorldScraper` (titre `h1.novel-title`, auteur `a.author-link`, cover
`og:image`, statut `.status-badge`, résumé `.summary-content`, genres via le
JSON-LD, contenu `#chapterText > p`).

## Limites & précautions

- **Droits / CGU** : le contenu de LightNovelWorld est sous copyright et son
  scraping enfreint vraisemblablement ses conditions. À réserver à un usage
  **local / apprentissage** — ne pas déployer publiquement un clone hébergeant
  ce contenu. Pour une version publique, utiliser du domaine public (Project
  Gutenberg, Standard Ebooks…).
- **Politesse** : garder `MAX` raisonnable et le délai entre requêtes ; ne pas
  lancer 3000 chapitres d'un coup sans raison. `MAX ≤ 0` **n'importe rien**
  (garde volontaire contre un crawl complet accidentel) — mettre une valeur > 0.
- **Genres en anglais** : LNW renvoie les genres en anglais (« Adventure »…),
  alors que le seed `04_genres_seed.sql` est en français. L'attribution des
  genres aux romans sera reprise proprement plus tard (modèle à définir).

## Dépannage

- *« no slug »* dans les logs → tu as oublié `SLUG=`.
- Champ vide (titre/résumé/contenu) → sélecteur à ajuster dans le scraper.
- Rien ne s'importe alors que la commande tourne → vérifier que Postgres est up
  (`make ps`) ; `run` le démarre normalement tout seul.
