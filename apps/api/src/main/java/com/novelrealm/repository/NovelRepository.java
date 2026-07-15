package com.novelrealm.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.novelrealm.model.Novel;
import com.novelrealm.model.Novel.NovelStatus;

import java.util.Optional;

public interface NovelRepository extends JpaRepository<Novel, Long> {
    // Clé naturelle pour l'ingestion idempotente (un slug = un roman).
    Optional<Novel> findBySlug(String slug);

    /**
     * Recherche/filtre du catalogue, paginée. Tous les critères sont optionnels
     * (ignorés si {@code null}) et combinables :
     * <ul>
     *   <li>{@code pattern} — motif LIKE (ex. {@code %tolkien%}), déjà en
     *       minuscules, comparé au titre OU à l'auteur (insensible à la casse)</li>
     *   <li>{@code status} — statut du roman</li>
     *   <li>{@code genreId} — présence du genre</li>
     * </ul>
     * Le tri (récent / A→Z) est porté par le {@link Pageable}.
     *
     * <p>Le motif est précalculé côté service (pas de {@code CONCAT} ici) pour
     * éviter que Postgres n'échoue à typer un paramètre {@code null}.
     */
    @Query("""
            SELECT n FROM Novel n
            WHERE (:pattern IS NULL OR LOWER(n.title) LIKE :pattern OR LOWER(n.author) LIKE :pattern)
              AND (:status IS NULL OR n.status = :status)
              AND (:genreId IS NULL OR EXISTS (SELECT 1 FROM n.genres g WHERE g.id = :genreId))
            """)
    Page<Novel> search(@Param("pattern") String pattern,
            @Param("status") NovelStatus status,
            @Param("genreId") Long genreId,
            Pageable pageable);

    /**
     * Même recherche/filtre, mais triée par POPULARITÉ (nombre d'ajouts en
     * bibliothèque, décroissant, puis les plus récents). Le tri est dans la
     * requête → le {@link Pageable} ne porte que la pagination.
     */
    @Query("""
            SELECT n FROM Novel n
            WHERE (:pattern IS NULL OR LOWER(n.title) LIKE :pattern OR LOWER(n.author) LIKE :pattern)
              AND (:status IS NULL OR n.status = :status)
              AND (:genreId IS NULL OR EXISTS (SELECT 1 FROM n.genres g WHERE g.id = :genreId))
            ORDER BY (SELECT COUNT(le) FROM LibraryEntry le WHERE le.novel = n) DESC, n.createdAt DESC
            """)
    Page<Novel> searchByPopularity(@Param("pattern") String pattern,
            @Param("status") NovelStatus status,
            @Param("genreId") Long genreId,
            Pageable pageable);
}
