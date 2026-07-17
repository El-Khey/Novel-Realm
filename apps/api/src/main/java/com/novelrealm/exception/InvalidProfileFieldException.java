package com.novelrealm.exception;

/**
 * Levée quand un champ du profil est invalide après nettoyage (pseudo vide,
 * préférences trop volumineuses…). → 400.
 */
public class InvalidProfileFieldException extends RuntimeException {

    public InvalidProfileFieldException(String message) {
        super(message);
    }
}
