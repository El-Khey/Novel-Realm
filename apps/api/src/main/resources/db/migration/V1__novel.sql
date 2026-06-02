-- =====================================================================
--  V1__novel.sql — première migration Flyway : la table "novel".
--
--  Flyway exécute ce script UNE SEULE FOIS au démarrage, puis enregistre
--  son empreinte (checksum) dans la table flyway_schema_history.
--  RÈGLE D'OR : une fois ce fichier appliqué quelque part, on n'y touche
--  PLUS JAMAIS. Toute évolution du schéma = un NOUVEAU fichier V2__...
--  (sinon Flyway détecte que le checksum a changé et refuse de démarrer).
--
--  C'est Flyway qui crée le schéma ; Hibernate est en mode "validate" et se
--  contente de vérifier que l'entité Novel.java colle EXACTEMENT à cette table.
-- =====================================================================

CREATE TABLE novel (
    -- IDENTITY = PostgreSQL génère l'id automatiquement (1, 2, 3, ...).
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    title       VARCHAR(512) NOT NULL,
    author      VARCHAR(255),
    description TEXT,                          -- synopsis (peut être long)
    cover_url   VARCHAR(1024),

    -- Statut de publication. Stocké en texte + contrainte CHECK plutôt qu'en
    -- type ENUM natif Postgres : plus simple à faire évoluer (un simple ALTER
    -- dans une future migration suffit). Côté Java : @Enumerated(EnumType.STRING).
    status      VARCHAR(32) NOT NULL DEFAULT 'ONGOING'
                CHECK (status IN ('ONGOING', 'COMPLETED', 'HIATUS')),

    -- ── Provenance (d'où vient la donnée) ──────────────────────────
    -- Prévu dès maintenant pour pouvoir, plus tard : re-scraper sans créer
    -- de doublons, et accueillir d'autres sources (import PDF, saisie manuelle).
    source_site VARCHAR(32) NOT NULL DEFAULT 'NOVELFIRE'
                CHECK (source_site IN ('NOVELFIRE', 'LOCAL', 'PDF_IMPORT')),
    source_url  VARCHAR(1024),
    external_id VARCHAR(255),                  -- identifiant/slug chez la source
    scraped_at  TIMESTAMPTZ,                   -- quand la donnée a été récupérée

    -- ── Horodatage (audit) ─────────────────────────────────────────
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Empêche deux fois le même novel pour une même source (dédup / re-scrape).
-- Index PARTIEL : la contrainte ne s'applique que quand external_id est rempli
-- (les entrées LOCAL/manuelles sans identifiant externe ne sont pas concernées).
CREATE UNIQUE INDEX ux_novel_source ON novel (source_site, external_id)
    WHERE external_id IS NOT NULL;

-- Accélère la recherche par titre insensible à la casse (ILIKE / lower(title)).
CREATE INDEX ix_novel_title ON novel (lower(title));
