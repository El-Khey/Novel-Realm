package com.novelrealm.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("Aucun utilisateur trouvé avec l'id " + id);
    }

    public UserNotFoundException(String email) {
        super("Aucun utilisateur trouvé avec l'email " + email);
    }
}