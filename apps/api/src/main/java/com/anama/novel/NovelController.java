package com.anama.novel;

import com.anama.novel.dto.NovelDetailDto;
import com.anama.novel.dto.NovelSummaryDto;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Routes HTTP des novels.
 *
 *   GET /api/novels       → la liste (résumés) pour la bibliothèque
 *   GET /api/novels/{id}  → le détail d'un novel (404 s'il n'existe pas)
 *
 * Le contrôleur ne fait QUE de l'aiguillage HTTP : il délègue tout au service
 * et ne connaît que les DTO.
 */
@RestController
@RequestMapping("/api/novels")
public class NovelController {

    private final NovelService novelService;

    public NovelController(NovelService novelService) {
        this.novelService = novelService;
    }

    @GetMapping
    public List<NovelSummaryDto> list() {
        return novelService.findAll();
    }

    @GetMapping("/{id}")
    public NovelDetailDto getOne(@PathVariable Long id) {
        // findById renvoie un Optional : présent → on renvoie le DTO ;
        // vide → on lève une 404 (Spring la transforme en réponse HTTP 404).
        return novelService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Novel introuvable : " + id));
    }
}
