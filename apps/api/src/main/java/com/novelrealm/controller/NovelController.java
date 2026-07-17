package com.novelrealm.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

import com.novelrealm.dto.GenreResponse;
import com.novelrealm.dto.NovelDetailResponse;
import com.novelrealm.dto.NovelResponse;
import com.novelrealm.dto.PageResponse;
import com.novelrealm.model.Novel;
import com.novelrealm.model.Novel.NovelStatus;
import com.novelrealm.service.NovelService;

@RestController
@RequestMapping("/api/novels")
public class NovelController {
    private final NovelService novelService;

    public NovelController(NovelService novelService) {
        this.novelService = novelService;
    }

    /**
     * Catalogue : recherche / filtre / tri, paginé. Tous les paramètres sont
     * optionnels et combinables.
     *
     * @param q       recherche titre ou auteur (insensible à la casse)
     * @param genreId filtre par genre
     * @param status  filtre par statut ({@code ONGOING} / {@code COMPLETED})
     * @param sort    {@code recent} (défaut) · {@code title} · {@code popularity}
     * @param page    numéro de page (défaut 0)
     * @param size    taille de page (défaut 20, max 100)
     */
    @GetMapping
    public ResponseEntity<PageResponse<NovelResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long genreId,
            @RequestParam(required = false) NovelStatus status,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<NovelResponse> result = novelService.search(q, status, genreId, sort, page, size)
                .map(NovelController::toResponse);
        return ResponseEntity.ok(PageResponse.from(result));
    }

    /** Fiche détail d'un roman (avec ses genres). */
    @GetMapping("/{id}")
    public ResponseEntity<NovelDetailResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(toDetailResponse(novelService.findWithGenresById(id)));
    }

    /** Entité → DTO (résumé de roman). */
    private static NovelResponse toResponse(Novel novel) {
        return new NovelResponse(
                novel.getId(),
                novel.getTitle(),
                novel.getAuthor(),
                novel.getDescription(),
                novel.getCoverUrl(),
                novel.getStatus(),
                novel.getCreatedAt());
    }

    /** Entité → DTO détail (résumé + genres triés par nom). */
    private static NovelDetailResponse toDetailResponse(Novel novel) {
        List<GenreResponse> genres = novel.getGenres().stream()
                .map(g -> new GenreResponse(g.getId(), g.getName()))
                .sorted(Comparator.comparing(GenreResponse::name))
                .toList();
        return new NovelDetailResponse(
                novel.getId(),
                novel.getTitle(),
                novel.getAuthor(),
                novel.getDescription(),
                novel.getCoverUrl(),
                novel.getStatus(),
                novel.getCreatedAt(),
                genres);
    }
}
