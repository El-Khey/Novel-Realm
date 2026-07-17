package com.novelrealm.exception;

public class NovelNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public NovelNotFoundException(Long id) {
        super("Aucun novel trouvé avec l'id " + id);
    }

}
