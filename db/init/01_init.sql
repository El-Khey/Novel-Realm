-- =====================================================================
--  Script d'initialisation de la base Novel Realm (PostgreSQL).
--
--  Ce fichier (et tous les .sql de ce dossier) est exécuté AUTOMATIQUEMENT
--  par le conteneur Postgres, UNE SEULE FOIS : à la toute première création
--  de la base (quand le volume de données est vide).
--
--  → Pour relancer ces scripts depuis zéro : `make clean` (supprime le
--    volume), puis `make dev` / `make db`.
--
--  Convention : on préfixe par un numéro (01_, 02_, ...) car les fichiers
--  sont exécutés dans l'ordre alphabétique.
--
--  Pour l'instant : aucune table. On repart propre. On ajoutera les
--  CREATE TABLE ici (ou dans des fichiers suivants) au fur et à mesure.
-- =====================================================================
Create Table IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    pseudo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    created_at TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP NOT NULL
);

Create Table IF NOT EXISTS novels (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cover_image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP NOT NULL
);