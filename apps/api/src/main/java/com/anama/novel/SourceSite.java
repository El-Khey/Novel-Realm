package com.anama.novel;

/**
 * Provenance d'un novel : d'où vient la donnée.
 *
 * Comme NovelStatus, les noms correspondent exactement à la contrainte CHECK
 * de la colonne source_site (migration V1), car stocké en texte.
 *
 * Pensé pour l'avenir : aujourd'hui on seed depuis NOVELFIRE, mais le modèle
 * accueille déjà la saisie manuelle (LOCAL) et un futur import de PDF.
 */
public enum SourceSite {
    NOVELFIRE,   // scrapé/seedé depuis le site NovelFire
    LOCAL,       // saisi à la main, sans source externe
    PDF_IMPORT   // importé depuis un fichier PDF (chantier futur)
}
