-- =====================================================================
--  Script d'initialisation de la base Novel Realm (PostgreSQL).
--
--  Exécuté AUTOMATIQUEMENT par le conteneur Postgres, UNE SEULE FOIS :
--  à la première création de la base (quand le volume de données est vide).
--  → Pour repartir de zéro : `make clean` (supprime le volume), puis
--    `make dev` / `make db`.
--
--  Convention : fichiers préfixés (01_, 02_, …), exécutés dans l'ordre
--  alphabétique. Les CREATE TABLE sont ordonnés selon les dépendances (FK).
--
--  Timestamps : created_at/updated_at ne sont posés QUE là où une
--  fonctionnalité ou un audit en a besoin. Les tables de référence (genres)
--  et de jointure pure (novel_genre, category_novel) n'en ont pas.
-- =====================================================================

-- ─────────────────────────── Utilisateurs ───────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    pseudo      VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),                          -- NULL pour un compte OAuth
    provider    VARCHAR(20)  NOT NULL DEFAULT 'LOCAL'
                CHECK (provider IN ('LOCAL', 'GOOGLE')),
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP NOT NULL
);

-- ──────────────────────────── Catalogue ─────────────────────────────
CREATE TABLE IF NOT EXISTS novels (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    cover_image_url VARCHAR(255),
    status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('ONGOING', 'COMPLETED')),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,    -- "à la une" sur l'Accueil
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL
);

-- Chapitres rattachés directement au roman (structure plate, web novel).
CREATE TABLE IF NOT EXISTS chapters (
    id             BIGSERIAL PRIMARY KEY,
    novel_id       BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,                       -- ordre dans le roman
    title          VARCHAR(255) NOT NULL,
    content        TEXT NOT NULL,
    created_at     TIMESTAMP NOT NULL,                 -- "derniers chapitres" (Accueil)
    updated_at     TIMESTAMP NOT NULL
);

-- Genres : table de référence (Fantasy, Romance, …).
CREATE TABLE IF NOT EXISTS genres (
    id    BIGSERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

-- Jointure M:N  novels ⇄ genres.
CREATE TABLE IF NOT EXISTS novel_genre (
    novel_id  BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    genre_id  BIGINT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (novel_id, genre_id)
);

-- ───────────────────────── Bibliothèque perso ───────────────────────
-- Romans suivis par un utilisateur, avec son statut de lecture.
CREATE TABLE IF NOT EXISTS library_entry (
    user_id   BIGINT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    novel_id  BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    status    VARCHAR(20) NOT NULL
              CHECK (status IN ('PLAN_TO_READ', 'READING', 'COMPLETED', 'PAUSED')), 
    added_at  TIMESTAMP NOT NULL,                      -- tri "date d'ajout"
    PRIMARY KEY (user_id, novel_id)
);

-- Étagères créées par l'utilisateur pour ranger sa bibliothèque.
CREATE TABLE IF NOT EXISTS categories (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name     VARCHAR(100) NOT NULL,
    UNIQUE (user_id, name)                             -- pas deux étagères de même nom
);

-- Jointure M:N  categories ⇄ novels.
CREATE TABLE IF NOT EXISTS category_novel (
    category_id  BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    novel_id     BIGINT NOT NULL REFERENCES novels(id)     ON DELETE CASCADE,
    PRIMARY KEY (category_id, novel_id)
);

-- ───────────────────────── Progression de lecture ───────────────────
-- État de lecture d'un chapitre pour un utilisateur (lu, position, date).
CREATE TABLE IF NOT EXISTS chapter_progress (
    user_id          BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    chapter_id       BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    scroll_position  INT NOT NULL DEFAULT 0,            -- reprise dans le chapitre
    read_at          TIMESTAMP NOT NULL,                -- historique / reprendre / tri
    PRIMARY KEY (user_id, chapter_id)
);
