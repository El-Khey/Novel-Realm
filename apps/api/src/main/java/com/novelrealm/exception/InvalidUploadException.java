package com.novelrealm.exception;

/**
 * Levée quand un fichier envoyé (avatar, bannière) est invalide : format non
 * pris en charge, taille dépassée, fichier vide. → 400.
 */
public class InvalidUploadException extends RuntimeException {

    public InvalidUploadException(String message) {
        super(message);
    }
}
