package com.anama.novel;

import com.anama.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * Entité JPA : un light/web novel de la bibliothèque.
 *
 * Elle mappe la table "novel" (créée par la migration V1). Comme Hibernate est
 * en mode "validate", CHAQUE champ ici doit correspondre à une colonne de la
 * table, sinon l'application refuse de démarrer (filet de sécurité voulu).
 *
 * RÈGLE du projet : une entité ne sort JAMAIS telle quelle de l'API. La couche
 * service la transforme en DTO (NovelSummaryDto / NovelDetailDto) avant la
 * réponse HTTP. L'entité reste un détail interne au backend.
 *
 * @Entity = classe persistée. @Table = nom exact de la table.
 * Hérite d'Auditable pour récupérer created_at / updated_at.
 */
@Entity
@Table(name = "novel")
public class Novel extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // l'id vient de la base (IDENTITY)
    private Long id;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(length = 255)
    private String author;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "cover_url", length = 1024)
    private String coverUrl;

    // EnumType.STRING => stocke "ONGOING" (le nom), pas un numéro.
    // NE JAMAIS utiliser EnumType.ORDINAL : réordonner l'enum corromprait les
    // données existantes en base.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NovelStatus status = NovelStatus.ONGOING;

    // ── Provenance ─────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "source_site", nullable = false, length = 32)
    private SourceSite sourceSite = SourceSite.NOVELFIRE;

    @Column(name = "source_url", length = 1024)
    private String sourceUrl;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "scraped_at")
    private OffsetDateTime scrapedAt;

    /**
     * Constructeur sans argument exigé par JPA/Hibernate (il instancie l'entité
     * puis remplit les champs par réflexion). On le garde "protected" pour
     * décourager son usage direct dans le code applicatif.
     */
    protected Novel() {
    }

    public Novel(String title, String author, String description, String coverUrl, NovelStatus status, SourceSite sourceSite, String sourceUrl, String externalId) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.coverUrl = coverUrl;
        this.status = status;
        this.sourceSite = sourceSite;
        this.sourceUrl = sourceUrl;
        this.externalId = externalId;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getDescription() {
        return description;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public NovelStatus getStatus() {
        return status;
    }

    public SourceSite getSourceSite() {
        return sourceSite;
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
