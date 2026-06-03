package com.anama.chapter.dto;

import com.anama.chapter.domain.ContentFormat;

/**
 * Le chapitre COMPLET pour la lecture : métadonnées + le texte.
 *
 * C'est le seul DTO qui transporte le contenu. On y met aussi novelId pour que
 * le front puisse proposer un retour vers la fiche du roman.
 */
public record ChapterReadDto(
        Long id,
        Long novelId,
        String chapterNumber,
        String title,
        String content,
        ContentFormat contentFormat) {
}
