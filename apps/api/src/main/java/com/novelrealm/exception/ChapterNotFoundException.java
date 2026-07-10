package com.novelrealm.exception;

public class ChapterNotFoundException extends RuntimeException {

    public ChapterNotFoundException(Long id) {
        super("Aucun chapitre trouvé avec l'id " + id);
    }

}
