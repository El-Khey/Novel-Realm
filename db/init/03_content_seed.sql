-- =====================================================================
--  Seed de contenu (chapitres) pour tester la fiche roman.
--  Exécuté une seule fois à la création de la base (après 02_novels_seed).
--  Structure plate : chaque chapitre pointe directement sur son roman.
--  novel_id 1..5 = ordre d'insertion de 02_novels_seed.sql.
-- =====================================================================

INSERT INTO chapters (novel_id, chapter_number, title, content, created_at, updated_at) VALUES
  -- Le Nom du Vent (novel 1)
  (1, 1, 'Un endroit pour les démons',
   'Le silence était de trois sortes. La plus évidente était le calme creux et résonnant des choses qui manquaient.',
   NOW(), NOW()),
  (1, 2, 'Une belle journée',
   'Kvothe essuya le comptoir d''un geste lent, repoussant le souvenir des jours anciens.',
   NOW(), NOW()),
  (1, 3, 'Le bois et le mot',
   'Au crépuscule, Chroniqueur arriva à l''auberge de la Pierre de Guet.',
   NOW(), NOW()),
  -- Mistborn (novel 2)
  (2, 1, 'Les cendres tombaient',
   'Les cendres tombaient du ciel comme une neige sale sur l''empire du Seigneur Maître.',
   NOW(), NOW()),
  (2, 2, 'La voleuse',
   'Vin avait appris très tôt à se méfier de tout le monde, surtout de ceux qui souriaient.',
   NOW(), NOW());
