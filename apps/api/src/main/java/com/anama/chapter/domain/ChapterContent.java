package com.anama.chapter.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entité JPA : le TEXTE d'un chapitre, isolé dans sa propre table.
 *
 * Mappe la table "chapter_content" (migration V2).
 *
 * Particularité : pas d'id auto-généré. La clé primaire (chapterId) est
 * RÉUTILISÉE depuis le chapitre correspondant → relation "un pour un".
 * Concrètement : pour le chapitre 42, son contenu a aussi chapterId = 42.
 *
 * On NE relie volontairement PAS cette entité à Chapter par une relation JPA :
 * on la charge à part, uniquement quand on affiche un chapitre. Ainsi le gros
 * texte ne peut JAMAIS être ramené par accident en listant les chapitres.
 */
@Entity
@Table(name = "chapter_content")
public class ChapterContent {

    @Id
    @Column(name = "chapter_id")
    private Long chapterId;        // = l'id du chapitre (pas auto-généré)

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_format", nullable = false, length = 16)
    private ContentFormat contentFormat = ContentFormat.PLAIN;

    protected ChapterContent() {
    }

    public ChapterContent(Long chapterId, String content, ContentFormat contentFormat) {
        this.chapterId = chapterId;
        this.content = content;
        this.contentFormat = contentFormat;
    }

    public Long getChapterId() {
        return chapterId;
    }

    public String getContent() {
        return content;
    }

    public ContentFormat getContentFormat() {
        return contentFormat;
    }
}
