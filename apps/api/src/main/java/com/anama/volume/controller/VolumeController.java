package com.anama.volume.controller;

import com.anama.volume.dto.VolumeDto;
import com.anama.volume.service.VolumeService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Routes HTTP des tomes.
 *
 *   GET /api/novels/{novelId}/volumes  → la liste des tomes d'un roman.
 *
 * Note : ce tome est une "sous-ressource" du roman, d'où l'URL imbriquée.
 */
@RestController
public class VolumeController {

    private final VolumeService volumeService;

    public VolumeController(VolumeService volumeService) {
        this.volumeService = volumeService;
    }

    @GetMapping("/api/novels/{novelId}/volumes")
    public List<VolumeDto> listForNovel(@PathVariable Long novelId) {
        return volumeService.listByNovel(novelId);
    }
}
