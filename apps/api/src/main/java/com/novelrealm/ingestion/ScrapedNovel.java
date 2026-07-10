package com.novelrealm.ingestion;

import java.util.List;

/** Métadonnées d'un roman extraites du HTML (données brutes, pas une entité). */
public record ScrapedNovel(
        String slug,
        String title,
        String author,
        String description,
        String coverUrl,
        String status,          // "Ongoing" / "Completed" (brut, mappé ensuite)
        List<String> genres) {
}
