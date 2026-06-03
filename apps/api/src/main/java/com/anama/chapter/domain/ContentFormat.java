package com.anama.chapter.domain;

/**
 * Format du texte stocké pour un chapitre.
 *
 * Décrit COMMENT le texte est écrit (à plat, en HTML, en Markdown), pas d'où il
 * vient. NovelFire fournit du HTML ; un futur import PDF donnera plutôt du PLAIN.
 *
 * Les noms correspondent à la contrainte CHECK de chapter_content (migration V2).
 */
public enum ContentFormat {
    PLAIN,     // texte brut
    HTML,      // balises HTML (ce que renvoie souvent NovelFire)
    MARKDOWN   // Markdown
}
