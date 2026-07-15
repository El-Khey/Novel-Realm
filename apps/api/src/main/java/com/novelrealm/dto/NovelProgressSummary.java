package com.novelrealm.dto;

/**
 * Résumé de progression d'un roman pour l'utilisateur : total de chapitres et
 * nombre déjà lus. Le front en déduit les chapitres restants (total − lus).
 */
public record NovelProgressSummary(
        Long novelId,
        long totalChapters,
        long readChapters
) {}
