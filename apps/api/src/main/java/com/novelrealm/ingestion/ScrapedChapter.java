package com.novelrealm.ingestion;

/** Contenu d'un chapitre extrait de sa page. */
public record ScrapedChapter(int chapterNumber, String title, String content) {
}
