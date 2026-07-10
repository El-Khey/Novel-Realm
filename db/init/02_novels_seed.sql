-- =====================================================================
--  Données de test (seed) pour la table novels.
--
--  Comme les scripts db/init/, ce fichier n'est exécuté qu'à la PREMIÈRE
--  création du volume Postgres (ou après un `make clean`).
--
--  En modèle "lecteur seul" (V1), les romans sont insérés à la main :
--  ce fichier sert de jeu de données pour développer et tester la
--  bibliothèque / le détail roman sans attendre une vraie ingestion.
--
--  status : 'ONGOING' ou 'COMPLETED' (texte — l'enum Java le relit via
--  @Enumerated(EnumType.STRING), comme pour users.provider).
-- =====================================================================
INSERT INTO novels (title, author, description, cover_image_url, status, created_at, updated_at)
VALUES
  (
    'Le Nom du Vent',
    'Patrick Rothfuss',
    'Kvothe, héros et hors-la-loi, raconte sa vie depuis son enfance chez les artistes itinérants jusqu''à son entrée dans une université de magie, en quête de réponses sur les créatures qui ont décimé sa famille.',
    NULL,
    'ONGOING',
    NOW(),
    NOW()
  ),
  (
    'Mistborn : L''Empire Ultime',
    'Brandon Sanderson',
    'Dans un monde où des cendres tombent du ciel et où un empereur immortel règne en tyran, une jeune voleuse découvre qu''elle possède un pouvoir rare : l''allomancie, la magie qui consume les métaux.',
    NULL,
    'COMPLETED',
    NOW(),
    NOW()
  ),
  (
    'La Voie des Rois',
    'Brandon Sanderson',
    'Sur Roshar, un monde balayé par de gigantesques tempêtes, plusieurs destins s''entrecroisent autour d''antiques armes magiques et d''un ordre de chevaliers disparu depuis des millénaires.',
    NULL,
    'ONGOING',
    NOW(),
    NOW()
  ),
  (
    'L''Assassin Royal : L''Apprenti Assassin',
    'Robin Hobb',
    'Fitz, fils bâtard d''un prince, est recueilli à la cour royale où il est secrètement formé au métier d''assassin, tout en luttant pour maîtriser un don de télépathie animale interdit.',
    NULL,
    'COMPLETED',
    NOW(),
    NOW()
  ),
  (
    'Gardiens des Cités Perdues',
    'Shannon Messenger',
    'Sophie, douze ans, a toujours su qu''elle était différente. Elle découvre qu''elle appartient à un peuple d''elfes télépathes vivant caché, et rejoint une académie où elle apprend à maîtriser ses pouvoirs.',
    NULL,
    'ONGOING',
    NOW(),
    NOW()
  );