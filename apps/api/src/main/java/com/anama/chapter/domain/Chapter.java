package com.anama.chapter.domain;

import com.anama.common.Auditable;
import com.anama.volume.domain.Volume;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * Entité JPA : un chapitre (ses MÉTADONNÉES seulement, pas le texte).
 *
 * Mappe la table "chapter" (migration V2). Le texte vit dans une entité à
 * part (ChapterContent), pour ne jamais le charger quand on liste les chapitres.
 *
 * Relation : @ManyToOne vers Volume (plusieurs chapitres → un volume).
 * Et comme Volume pointe lui-même vers Novel, on peut "remonter" la chaîne
 * chapter → volume → novel dans les requêtes.
 */
@Entity
@Table(name = "chapter")
public class Chapter extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "volume_id", nullable = false)
    private Volume volume;

    // Position de lecture dans le volume (entier => tri fiable).
    @Column(nullable = false)
    private Integer ordinal;

    // Libellé affiché ("12.5", "Prologue"...). Texte, pas un nombre.
    @Column(name = "chapter_number", length = 64)
    private String chapterNumber;

    @Column(length = 512)
    private String title;

    @Column(name = "source_url", length = 1024)
    private String sourceUrl;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "scraped_at")
    private OffsetDateTime scrapedAt;

    protected Chapter() {
    }

    public Chapter(Volume volume, Integer ordinal, String chapterNumber, String title) {
        this.volume = volume;
        this.ordinal = ordinal;
        this.chapterNumber = chapterNumber;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public Volume getVolume() {
        return volume;
    }

    public Integer getOrdinal() {
        return ordinal;
    }

    public String getChapterNumber() {
        return chapterNumber;
    }

    public String getTitle() {
        return title;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getExternalId() {
        return externalId;
    }

    public OffsetDateTime getScrapedAt() {
        return scrapedAt;
    }
}
