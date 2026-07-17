package com.novelrealm.exception;

/**
 * Levée quand on tente de mettre en favori un chapitre déjà présent (la clé
 * (user_id, chapter_id) doit rester unique). → 409.
 */
public class ChapterAlreadyFavoritedException extends RuntimeException {

    public ChapterAlreadyFavoritedException(Long chapterId) {
        super("Ce chapitre (id " + chapterId + ") est déjà dans vos favoris");
    }
}
