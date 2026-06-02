package com.anama.novel.dto;

import com.anama.novel.NovelStatus;
import com.anama.novel.SourceSite;

/**
 * Vue "complète" d'un novel, pour la page de détail.
 *
 * Contient les champs de la fiche en plus du résumé. Plus tard (M4), on y
 * ajoutera les genres puis la liste des volumes/chapitres.
 */
public record NovelDetailDto(
        Long id,
        String title,
        String author,
        String description,
        String coverUrl,
        NovelStatus status,
        SourceSite sourceSite,
        String sourceUrl) {
}
