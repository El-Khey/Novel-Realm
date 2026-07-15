package com.novelrealm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.novelrealm.model.Chapter;
import com.novelrealm.dto.NovelChapterCount;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    // Chapitres d'un roman, triés par numéro (relation directe novel → chapter).
    List<Chapter> findByNovelIdOrderByChapterNumber(Long novelId);

    // Nombre total de chapitres par roman (pour le résumé de progression).
    @Query("select new com.novelrealm.dto.NovelChapterCount(c.novel.id, count(c)) "
            + "from Chapter c group by c.novel.id")
    List<NovelChapterCount> countChaptersPerNovel();
}
