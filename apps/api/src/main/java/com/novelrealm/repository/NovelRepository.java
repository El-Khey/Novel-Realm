package com.novelrealm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.novelrealm.model.Novel;
import java.util.List;
import java.util.Optional;

public interface NovelRepository extends JpaRepository<Novel, Long> {
    // Clé naturelle pour l'ingestion idempotente (un slug = un roman).
    Optional<Novel> findBySlug(String slug);

    // Romans possédant un genre donné (traverse la jointure novel_genre).
    List<Novel> findByGenres_Id(Long genreId);
}
