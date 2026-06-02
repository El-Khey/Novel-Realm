package com.anama.chapter;

import com.anama.chapter.dto.ChapterListItemDto;
import com.anama.chapter.dto.ChapterReadDto;
import com.anama.volume.Volume;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique des chapitres + traduction entité → DTO.
 *
 * @Transactional(readOnly = true) : on reste en lecture. Important aussi pour
 * les relations "paresseuses" (LAZY) : tant qu'on est DANS une méthode
 * transactionnelle, accéder à chapter.getVolume() déclenche le chargement sans
 * erreur. En dehors (ex. pendant la réponse HTTP), ça planterait — d'où la
 * règle : on convertit en DTO ICI, dans le service.
 */
@Service
@Transactional(readOnly = true)
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final ChapterContentRepository chapterContentRepository;

    public ChapterService(ChapterRepository chapterRepository,
                          ChapterContentRepository chapterContentRepository) {
        this.chapterRepository = chapterRepository;
        this.chapterContentRepository = chapterContentRepository;
    }

    /** La liste des chapitres d'un roman, dans l'ordre de lecture (sans texte). */
    public List<ChapterListItemDto> listByNovel(Long novelId) {
        return chapterRepository.findByNovelOrderedForReading(novelId).stream()
                .map(ChapterService::toListItem)
                .toList();
    }

    /**
     * Un chapitre complet (avec son texte) pour la lecture.
     * Deux lectures : le chapitre (métadonnées) + son contenu (table séparée).
     * Optional vide si le chapitre n'existe pas.
     */
    public Optional<ChapterReadDto> read(Long chapterId) {
        return chapterRepository.findById(chapterId).map(chapter -> {
            // Le texte vit dans chapter_content (même id que le chapitre).
            ChapterContent content = chapterContentRepository.findById(chapterId)
                    .orElse(null);
            Volume volume = chapter.getVolume();
            return new ChapterReadDto(
                    chapter.getId(),
                    volume.getNovel().getId(),
                    chapter.getChapterNumber(),
                    chapter.getTitle(),
                    content != null ? content.getContent() : null,
                    content != null ? content.getContentFormat() : null);
        });
    }

    // ── Conversions entité → DTO ───────────────────────────────────

    private static ChapterListItemDto toListItem(Chapter c) {
        Volume v = c.getVolume(); // déjà chargé par le "join fetch" de la requête
        return new ChapterListItemDto(
                c.getId(),
                c.getOrdinal(),
                c.getChapterNumber(),
                c.getTitle(),
                v.getVolumeNumber(),
                v.getTitle());
    }
}
