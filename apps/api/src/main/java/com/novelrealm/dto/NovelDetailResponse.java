package com.novelrealm.dto;

import java.time.Instant;
import java.util.List;

import com.novelrealm.model.Novel.NovelStatus;

/**
 * Détail d'un roman (page « fiche »). Superset de {@link NovelResponse} : ajoute
 * les genres, exposés uniquement sur {@code GET /api/novels/{id}}.
 */
public record NovelDetailResponse(
        Long id,
        String title,
        String author,
        String description,
        String coverImageUrl,
        NovelStatus status,
        Instant createdAt,
        List<GenreResponse> genres
) {}
