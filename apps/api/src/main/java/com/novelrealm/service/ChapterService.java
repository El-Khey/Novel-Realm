package com.novelrealm.service;

import com.novelrealm.model.Chapter;
import com.novelrealm.repository.ChapterRepository;
import com.novelrealm.dto.NovelChapterCount;
import com.novelrealm.exception.ChapterNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class ChapterService {
    private final ChapterRepository chapterRepository;

    public ChapterService(ChapterRepository chapterRepository) {
        this.chapterRepository = chapterRepository;
    }

    public List<Chapter> findAllByNovelId(Long novelId) {
        return this.chapterRepository.findByNovelIdOrderByChapterNumber(novelId);
    }

    /** Chapitres existants parmi une liste d'ids (les ids inconnus sont ignorés). */
    public List<Chapter> findAllByIds(List<Long> ids) {
        return this.chapterRepository.findAllById(ids);
    }

    public Chapter findById(Long id) {
        return chapterRepository.findById(id)
                .orElseThrow(() -> new ChapterNotFoundException(id));
    }

    /** Nombre total de chapitres par roman (pour le résumé de progression). */
    public List<NovelChapterCount> countChaptersPerNovel() {
        return chapterRepository.countChaptersPerNovel();
    }
}
