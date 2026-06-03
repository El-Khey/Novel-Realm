    package com.anama.novel.service;

    import com.anama.novel.domain.Novel;
    import com.anama.novel.dto.NovelDetailDto;
    import com.anama.novel.dto.NovelSummaryDto;
    import com.anama.novel.mapper.NovelMapper;
    import com.anama.novel.repository.NovelRepository;
    import java.util.List;
    import java.util.Optional;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    /**
     * Logique métier des novels.
     *
     * C'est la seule couche qui manipule l'entité Novel. Elle ne renvoie au
     * contrôleur que des DTO (jamais l'entité), via le NovelMapper.
     *
     * @Transactional(readOnly = true) au niveau de la classe : par défaut chaque
     * méthode s'exécute dans une transaction en lecture seule. Important car
     * open-in-view = false : tout chargement de données doit se faire DANS le
     * service, pas pendant la sérialisation de la réponse. Les méthodes qui
     * ÉCRIVENT redéclarent @Transactional pour repasser en lecture/écriture.
     */
    @Service
    @Transactional(readOnly = true)
    public class NovelService {

        private final NovelRepository novelRepository;
        private final NovelMapper novelMapper;

        // Injection par constructeur (la façon recommandée) : Spring fournit
        // automatiquement le repository et le mapper au démarrage.
        public NovelService(NovelRepository novelRepository, NovelMapper novelMapper) {
            this.novelRepository = novelRepository;
            this.novelMapper = novelMapper;
        }

        /** Tous les novels, en version "résumé" pour la bibliothèque. */
        public List<NovelSummaryDto> findAll() {
            return novelRepository.findAll().stream()
                    .map(novelMapper::toSummary)
                    .toList();
        }

        /** Un novel en version "détail", ou Optional vide s'il n'existe pas. */
        public Optional<NovelDetailDto> findById(Long id) {
            return novelRepository.findById(id).map(novelMapper::toDetail);
        }

        // ── Opérations internes (seed / futur import) ──────────────────
        // Ces méthodes travaillent au niveau ENTITÉ et ne sont PAS exposées en HTTP.
        // Elles servent au peuplement de la base (NovelDevSeeder), qui doit câbler
        // des relations (Novel ← Volume ← Chapter) impossibles à exprimer en DTO.

        /** Nombre de novels en base (sert au seed idempotent). */
        public long count() {
            return novelRepository.count();
        }

        /** Persiste un novel et renvoie l'entité gérée (usage interne). */
        @Transactional
        public Novel create(Novel novel) {
            return novelRepository.save(novel);
        }

        /** Retrouve l'entité par son identifiant externe (usage interne). */
        public Optional<Novel> findEntityByExternalId(String externalId) {
            return novelRepository.findFirstByExternalId(externalId);
        }
    }
