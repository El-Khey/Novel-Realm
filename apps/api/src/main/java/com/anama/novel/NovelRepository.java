package com.anama.novel;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Accès aux données des novels.
 *
 * En héritant de JpaRepository<Novel, Long>, Spring Data fournit
 * automatiquement les opérations courantes (findAll, findById, save, count,
 * delete, ...) — aucune implémentation à écrire de notre côté.
 *
 *   <Novel, Long> = entité gérée = Novel ; type de sa clé primaire = Long.
 */
public interface NovelRepository extends JpaRepository<Novel, Long> {

    // Requête dérivée : SELECT ... WHERE external_id = ? LIMIT 1.
    // Utilisée par le seed pour retrouver un roman par son slug NovelFire.
    Optional<Novel> findFirstByExternalId(String externalId);
}
