-- =====================================================================
--  Seed des genres (table de référence).
--  Le rattachement roman ⇄ genre (table novel_genre) viendra avec la
--  partie "novel" (vraies données).
-- =====================================================================

INSERT INTO genres (name) VALUES
  ('Fantasy'),
  ('Science-Fiction'),
  ('Aventure'),
  ('Action'),
  ('Romance'),
  ('Mystère'),
  ('Horreur'),
  ('Comédie'),
  ('Drame'),
  ('Cultivation');
