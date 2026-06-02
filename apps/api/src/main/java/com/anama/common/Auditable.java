package com.anama.common;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.OffsetDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Classe de base mutualisant les colonnes d'horodatage (created_at / updated_at).
 *
 * @MappedSuperclass = ce n'est PAS une table à elle seule. Ses champs sont
 * "recopiés" dans chaque entité qui en hérite (ici Novel). Ça évite de répéter
 * les deux colonnes dans toutes les entités.
 *
 * Les annotations Hibernate font le travail automatiquement :
 *   - @CreationTimestamp : rempli une fois, à l'insertion.
 *   - @UpdateTimestamp   : ré-écrit à chaque mise à jour de la ligne.
 * La base a aussi un DEFAULT now() (voir la migration) : ce filet sert si une
 * ligne est insérée en SQL brut (ex. le seed) sans passer par Hibernate.
 */
@MappedSuperclass
public abstract class Auditable {

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
