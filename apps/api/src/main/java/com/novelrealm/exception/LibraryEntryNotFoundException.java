package com.novelrealm.exception;

/**
 * Levée quand on tente de modifier/supprimer une entrée de bibliothèque qui
 * n'existe pas pour ce couple (utilisateur, roman). → 404.
 */
public class LibraryEntryNotFoundException extends RuntimeException {

    public LibraryEntryNotFoundException(Long novelId) {
        super("Ce roman (id " + novelId + ") n'est pas dans votre bibliothèque");
    }
}
