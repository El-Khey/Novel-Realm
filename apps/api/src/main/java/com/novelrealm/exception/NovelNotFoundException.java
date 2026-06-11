package com.novelrealm.exception;

public class NovelNotFoundException extends RuntimeException {

    public NovelNotFoundException(Long id) {
        super("Aucun novel trouvé avec l'id " + id);
    }

}
