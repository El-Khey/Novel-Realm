-- =====================================================================
--  V2__volume_chapter_content.sql — le "cœur lecture" : volumes, chapitres
--  et contenu des chapitres.
--
--  Rappel RÈGLE D'OR : V1 a déjà été appliquée et enregistrée par Flyway,
--  on n'y touche plus. Toute nouvelle table = un nouveau fichier (ici V2).
--  Au prochain démarrage, Flyway verra "V1 déjà fait" et n'exécutera que V2.
-- =====================================================================

-- ── VOLUME : un tome appartenant à un roman ─────────────────────────
CREATE TABLE volume (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- CLÉ ÉTRANGÈRE : relie ce volume à une ligne de la table novel.
    -- REFERENCES novel(id) = "novel_id doit exister dans novel.id".
    -- ON DELETE CASCADE = si on supprime un roman, ses volumes partent avec.
    novel_id      BIGINT NOT NULL REFERENCES novel(id) ON DELETE CASCADE,

    volume_number INTEGER NOT NULL,      -- 1, 2, 3... (web novel => 1 seul)
    title         VARCHAR(512),          -- ex. "Tome 1 : ..." (peut être vide)

    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Pas deux fois le "volume 2" pour un même roman.
    CONSTRAINT ux_volume_novel_number UNIQUE (novel_id, volume_number)
);
-- Index sur la clé étrangère : accélère "tous les volumes de ce roman".
CREATE INDEX ix_volume_novel ON volume (novel_id);

-- ── CHAPTER : métadonnées d'un chapitre (PAS le texte) ──────────────
CREATE TABLE chapter (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    volume_id      BIGINT NOT NULL REFERENCES volume(id) ON DELETE CASCADE,

    -- ORDRE DE LECTURE dans le volume (1, 2, 3...). C'est un entier => tri fiable.
    ordinal        INTEGER NOT NULL,

    -- LIBELLÉ affiché. Volontairement du TEXTE, pas un nombre : on voit chez
    -- NovelFire "Chapter 12.5", "Prologue", "Side Story"... un entier ne suffit pas.
    chapter_number VARCHAR(64),
    title          VARCHAR(512),

    -- Provenance (comme pour novel) : utile pour un futur re-scrape.
    source_url     VARCHAR(1024),
    external_id    VARCHAR(255),
    scraped_at     TIMESTAMPTZ,

    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Pas deux chapitres à la même position dans un même volume.
    CONSTRAINT ux_chapter_volume_ordinal UNIQUE (volume_id, ordinal)
);
CREATE INDEX ix_chapter_volume ON chapter (volume_id);

-- ── CHAPTER_CONTENT : le gros texte, isolé ──────────────────────────
-- Table séparée volontairement : la clé primaire EST la clé étrangère vers
-- chapter (relation "un pour un"). Comme ça, lister les chapitres ne touche
-- jamais cette table ; on ne la lit que pour AFFICHER un chapitre précis.
CREATE TABLE chapter_content (
    chapter_id     BIGINT PRIMARY KEY REFERENCES chapter(id) ON DELETE CASCADE,
    content        TEXT NOT NULL,
    content_format VARCHAR(16) NOT NULL DEFAULT 'PLAIN'
                   CHECK (content_format IN ('PLAIN', 'HTML', 'MARKDOWN'))
);
