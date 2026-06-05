package com.novelrealm.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("Aucun utilisateur trouvé avec l'id " + id);
    }
}