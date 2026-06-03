package com.anama.chapter.controller;

import com.anama.chapter.dto.ChapterListItemDto;
import com.anama.chapter.dto.ChapterReadDto;
import com.anama.chapter.service.ChapterService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Routes HTTP des chapitres.
 *
 *   GET /api/novels/{novelId}/chapters  → la liste des chapitres d'un roman
 *                                          (page détail). Sans le texte.
 *   GET /api/chapters/{id}              → un chapitre complet AVEC son texte
 *                                          (page lecture). 404 s'il n'existe pas.
 *
 * Pas de @RequestMapping au niveau de la classe : les deux routes ont des
 * préfixes différents (/api/novels/... et /api/chapters/...), donc on écrit le
 * chemin complet sur chaque méthode.
 */
@RestController
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @GetMapping("/api/novels/{novelId}/chapters")
    public List<ChapterListItemDto> listForNovel(@PathVariable Long novelId) {
        return chapterService.listByNovel(novelId);
    }

    @GetMapping("/api/chapters/{id}")
    public ChapterReadDto read(@PathVariable Long id) {
        return chapterService.read(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Chapitre introuvable : " + id));
    }
}
