package com.novelrealm.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.novelrealm.service.NovelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.novelrealm.dto.NovelResponse;
import com.novelrealm.model.Novel;





@RestController
@RequestMapping("/api/novels")
public class NovelController {
    private final NovelService novelService;
    
    public NovelController(NovelService novelService) {
        this.novelService = novelService;
    }


    // Catalogue : tous les romans, ou filtrés par genre si ?genreId= est fourni.
    @GetMapping
    public ResponseEntity<List<NovelResponse>> findAll(@RequestParam(required = false) Long genreId) {
        List<Novel> novels = (genreId != null)
                ? novelService.findByGenre(genreId)
                : novelService.findAll();
        List<NovelResponse> body = novels.stream()
                .map(novel -> new NovelResponse(
                        novel.getId(),
                        novel.getTitle(),
                        novel.getAuthor(),
                        novel.getDescription(),
                        novel.getCoverUrl(),
                        novel.getStatus(),
                        novel.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NovelResponse> findById(@PathVariable Long id) {
        Novel novel = novelService.findById(id);
        NovelResponse body = new NovelResponse(
                novel.getId(),
                novel.getTitle(),
                novel.getAuthor(),
                novel.getDescription(),
                novel.getCoverUrl(),
                novel.getStatus(),
                novel.getCreatedAt());
        return ResponseEntity.ok(body);
    }


}
