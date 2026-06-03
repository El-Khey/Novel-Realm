package com.anama.chapter.repository;

import com.anama.chapter.domain.ChapterContent;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Accès au contenu (texte) des chapitres.
 *
 * La clé est un Long = le chapterId. Pour afficher le chapitre 42, on appelle
 * findById(42) sur ce repository. C'est le SEUL endroit qui charge le gros texte.
 */
public interface ChapterContentRepository extends JpaRepository<ChapterContent, Long> {
}
