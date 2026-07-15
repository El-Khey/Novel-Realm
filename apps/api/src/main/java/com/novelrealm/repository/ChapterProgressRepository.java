package com.novelrealm.repository;

import java.util.List;
import java.util.Optional;

import com.novelrealm.dto.NovelChapterCount;
import com.novelrealm.model.ChapterProgress;
import com.novelrealm.model.ChapterProgressId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès à la progression de lecture.
 *
 * <p>Les requêtes « traversent » les relations {@code @ManyToOne} : {@code User_Id}
 * = {@code user.id}, {@code Chapter_Id} = {@code chapter.id}, et
 * {@code Chapter_Novel_Id} = {@code chapter.novel.id} (progression de tous les
 * chapitres d'un roman).
 */
public interface ChapterProgressRepository extends JpaRepository<ChapterProgress, ChapterProgressId> {

    /** La progression d'un utilisateur sur un chapitre précis, si elle existe. */
    Optional<ChapterProgress> findByUser_IdAndChapter_Id(Long userId, Long chapterId);

    /** Toute la progression d'un utilisateur sur les chapitres d'un roman. */
    List<ChapterProgress> findByUser_IdAndChapter_Novel_Id(Long userId, Long novelId);

    /** Nombre de chapitres LUS par roman, pour un utilisateur (résumé de progression). */
    @Query("select new com.novelrealm.dto.NovelChapterCount(cp.chapter.novel.id, count(cp)) "
            + "from ChapterProgress cp where cp.user.id = :userId and cp.read = true "
            + "group by cp.chapter.novel.id")
    List<NovelChapterCount> countReadPerNovel(@Param("userId") Long userId);
}
