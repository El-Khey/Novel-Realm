package com.anama.volume.dto;

/**
 * Vue d'un tome pour le front (page détail d'un roman : regrouper les chapitres
 * par tome). On n'expose pas le roman parent : l'appel se fait déjà sous
 * /api/novels/{novelId}/volumes, donc le contexte est connu.
 */
public record VolumeDto(
        Long id,
        Integer volumeNumber,
        String title) {
}
