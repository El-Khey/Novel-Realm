package com.anama.volume.domain;

import com.anama.common.Auditable;
import com.anama.novel.domain.Novel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entité JPA : un tome (volume) appartenant à un roman.
 *
 * Mappe la table "volume" (migration V2).
 *
 * LA RELATION (le nouveau concept) :
 *   @ManyToOne = "plusieurs Volume pointent vers UN Novel".
 *   @JoinColumn(name = "novel_id") = la colonne clé étrangère en base.
 *   fetch = LAZY = on ne charge le Novel parent QUE si on y accède vraiment
 *                  (évite de tout charger inutilement). C'est la valeur
 *                  recommandée pour les @ManyToOne.
 *   optional = false = un volume a TOUJOURS un roman (NOT NULL en base).
 */
@Entity
@Table(name = "volume")
public class Volume extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;

    @Column(name = "volume_number", nullable = false)
    private Integer volumeNumber;

    @Column(length = 512)
    private String title;

    protected Volume() {
    }

    public Volume(Novel novel, Integer volumeNumber, String title) {
        this.novel = novel;
        this.volumeNumber = volumeNumber;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public Novel getNovel() {
        return novel;
    }

    public Integer getVolumeNumber() {
        return volumeNumber;
    }

    public String getTitle() {
        return title;
    }
}
