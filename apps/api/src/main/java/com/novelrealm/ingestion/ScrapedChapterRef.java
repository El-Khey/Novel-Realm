package com.novelrealm.ingestion;

/** Référence d'un chapitre dans la liste (numéro + titre + URL), sans contenu. */
public record ScrapedChapterRef(int chapterNumber, String title, String url) {
}
