package com.anama.novel;

import com.anama.novel.dto.NovelDetailDto;
import com.anama.novel.dto.NovelSummaryDto;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique métier des novels + traduction entité → DTO.
 *
 * C'est la seule couche qui manipule l'entité Novel. Elle ne renvoie au
 * contrôleur que des DTO (jamais l'entité). On reste en lecture seule ici.
 *
 * @Transactional(readOnly = true) : chaque méthode s'exécute dans une
 * transaction. Important car open-in-view = false : tout chargement de données
 * doit se faire DANS le service, pas pendant la sérialisation de la réponse.
 */
@Service
@Transactional(readOnly = true)
public class NovelService {

    private final NovelRepository novelRepository;

    // Injection par constructeur (la façon recommandée) : Spring fournit
    // automatiquement le NovelRepository au démarrage.
    public NovelService(NovelRepository novelRepository) {
        this.novelRepository = novelRepository;
    }

    /** Tous les novels, en version "résumé" pour la bibliothèque. */
    public List<NovelSummaryDto> findAll() {
        return novelRepository.findAll().stream()
                .map(NovelService::toSummary)
                .toList();
    }

    /** Un novel en version "détail", ou Optional vide s'il n'existe pas. */
    public Optional<NovelDetailDto> findById(Long id) {
        return novelRepository.findById(id).map(NovelService::toDetail);
    }

    // ── Conversions entité → DTO ───────────────────────────────────

    private static NovelSummaryDto toSummary(Novel n) {
        return new NovelSummaryDto(
                n.getId(),
                n.getTitle(),
                n.getAuthor(),
                n.getCoverUrl(),
                n.getStatus());
    }

    private static NovelDetailDto toDetail(Novel n) {
        return new NovelDetailDto(
                n.getId(),
                n.getTitle(),
                n.getAuthor(),
                n.getDescription(),
                n.getCoverUrl(),
                n.getStatus(),
                n.getSourceSite(),
                n.getSourceUrl());
    }
}
