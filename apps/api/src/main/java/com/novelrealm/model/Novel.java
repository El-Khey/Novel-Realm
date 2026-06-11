package com.novelrealm.model;

import java.time.Instant;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "novels")
public class Novel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String description;

    @Column(nullable = true)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NovelStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(nullable = false)
    private Instant updatedAt;

    public enum NovelStatus {
        ONGOING,
        COMPLETED
    }

    protected Novel() {}
    
    public Novel(String title, String author, String description, String coverImageUrl, NovelStatus status) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.coverImageUrl = coverImageUrl;
        this.status = status;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
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
        return coverImageUrl;
    }

    public NovelStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setStatus(NovelStatus status) {
        this.status = status;
    }

}
