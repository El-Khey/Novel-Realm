package com.anama.chapter.dto;

/**
 * Une ligne de la liste des chapitres (page détail d'un roman).
 *
 * On expose juste de quoi afficher et cliquer : le numéro, le titre, et à quel
 * tome il appartient (pour pouvoir grouper par volume côté front). PAS le texte.
 */
public record ChapterListItemDto(
        Long id,
        Integer ordinal,
        String chapterNumber,
        String title,
        Integer volumeNumber,
        String volumeTitle) {
}
