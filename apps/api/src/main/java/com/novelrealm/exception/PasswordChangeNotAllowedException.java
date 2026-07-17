package com.novelrealm.exception;

/**
 * Levée quand un compte Google (sans mot de passe local) tente de changer de
 * mot de passe. → 409.
 */
public class PasswordChangeNotAllowedException extends RuntimeException {

    public PasswordChangeNotAllowedException() {
        super("Ce compte utilise la connexion Google : le mot de passe se gère chez Google");
    }
}
