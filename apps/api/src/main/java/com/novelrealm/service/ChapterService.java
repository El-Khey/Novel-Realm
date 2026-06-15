package com.novelrealm.service;

import com.novelrealm.model.Chapter;
import com.novelrealm.repository.ChapterRepository;
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

    public Chapter findById(Long id) {
        return chapterRepository.findById(id)
                .orElseThrow(() -> new ChapterNotFoundException(id));
    }
}
