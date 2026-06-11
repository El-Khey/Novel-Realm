package com.novelrealm.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.novelrealm.service.NovelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.novelrealm.dto.NovelResponse;



@RestController
@RequestMapping("/api/novels")
public class NovelController {
    private final NovelService novelService;
    
    public NovelController(NovelService novelService) {
        this.novelService = novelService;
    }


    @GetMapping
    public ResponseEntity<List<NovelResponse>> findAll() {
        List<NovelResponse> body = novelService.findAll().stream()
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
    
    
    
}
