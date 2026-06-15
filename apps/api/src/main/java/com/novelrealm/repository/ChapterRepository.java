package com.novelrealm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.novelrealm.model.Chapter;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    // Chapitres d'un roman, triés par numéro (relation directe novel → chapter).
    List<Chapter> findByNovelIdOrderByChapterNumber(Long novelId);
}
