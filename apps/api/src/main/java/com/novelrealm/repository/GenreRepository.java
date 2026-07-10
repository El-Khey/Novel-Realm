package com.novelrealm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.novelrealm.model.Genre;
import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {
    // Pour le "find-or-create" lors de l'ingestion.
    Optional<Genre> findByName(String name);
}
