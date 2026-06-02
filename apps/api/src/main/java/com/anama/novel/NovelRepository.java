package com.anama.novel;

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
}
