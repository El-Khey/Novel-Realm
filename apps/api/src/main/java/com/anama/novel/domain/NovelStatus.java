package com.anama.novel.domain;

/**
 * Statut de publication d'un novel.
 *
 * Les noms des constantes (ONGOING, ...) doivent correspondre EXACTEMENT aux
 * valeurs autorisées par la contrainte CHECK de la table novel (migration V1),
 * car on stocke l'enum sous forme de texte (@Enumerated(EnumType.STRING)).
 */
public enum NovelStatus {
    ONGOING,    // en cours de publication
    COMPLETED,  // terminé
    HIATUS      // en pause
}
