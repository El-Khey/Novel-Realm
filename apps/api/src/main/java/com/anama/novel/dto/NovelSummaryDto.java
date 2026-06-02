package com.anama.novel.dto;

import com.anama.novel.NovelStatus;

/**
 * Vue "légère" d'un novel, pour la grille de la bibliothèque.
 *
 * On n'expose que ce dont la liste a besoin (pas la description ni la
 * provenance). Un "record" Java = classe immuable minimale : le compilateur
 * génère le constructeur et les accesseurs. Spring le convertit en JSON.
 */
public record NovelSummaryDto(
        Long id,
        String title,
        String author,
        String coverUrl,
        NovelStatus status) {
}
