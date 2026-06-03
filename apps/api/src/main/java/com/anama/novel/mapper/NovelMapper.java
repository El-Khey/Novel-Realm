package com.anama.novel.mapper;

import com.anama.novel.domain.Novel;
import com.anama.novel.dto.NovelDetailDto;
import com.anama.novel.dto.NovelSummaryDto;
import org.springframework.stereotype.Component;

/**
 * Traduction entité Novel → DTO.
 *
 * On EXTRAIT ici ce qui était avant des méthodes privées du service. Pourquoi ?
 *   - Le service ne garde plus que la LOGIQUE métier (quoi charger, quelles
 *     règles), et délègue la simple recopie de champs au mapper.
 *   - La traduction devient réutilisable et testable isolément.
 *
 * @Component = Spring instancie ce mapper et l'injecte dans le service.
 * Il ne contient aucun état : juste des fonctions de conversion.
 */
@Component
public class NovelMapper {

    /** Vue "résumé" pour la grille de la bibliothèque. */
    public NovelSummaryDto toSummary(Novel n) {
        return new NovelSummaryDto(
                n.getId(),
                n.getTitle(),
                n.getAuthor(),
                n.getCoverUrl(),
                n.getStatus());
    }

    /** Vue "détail" pour la fiche d'un novel. */
    public NovelDetailDto toDetail(Novel n) {
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
