package com.anama.chapter.service;

import com.anama.chapter.domain.Chapter;
import com.anama.chapter.domain.ChapterContent;
import com.anama.chapter.domain.ContentFormat;
import com.anama.chapter.dto.ChapterListItemDto;
import com.anama.chapter.dto.ChapterReadDto;
import com.anama.chapter.mapper.ChapterMapper;
import com.anama.chapter.repository.ChapterContentRepository;
import com.anama.chapter.repository.ChapterRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique métier des chapitres.
 *
 * @Transactional(readOnly = true) au niveau classe : on reste en lecture par
 * défaut. Important aussi pour les relations "paresseuses" (LAZY) : tant qu'on
 * est DANS une méthode transactionnelle, accéder à chapter.getVolume() déclenche
 * le chargement sans erreur — d'où le fait qu'on appelle le mapper ICI.
 */
@Service
@Transactional(readOnly = true)
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final ChapterContentRepository chapterContentRepository;
    private final ChapterMapper chapterMapper;

    public ChapterService(ChapterRepository chapterRepository,
                          ChapterContentRepository chapterContentRepository,
                          ChapterMapper chapterMapper) {
        this.chapterRepository = chapterRepository;
        this.chapterContentRepository = chapterContentRepository;
        this.chapterMapper = chapterMapper;
    }

    /** La liste des chapitres d'un roman, dans l'ordre de lecture (sans texte). */
    public List<ChapterListItemDto> listByNovel(Long novelId) {
        return chapterRepository.findByNovelOrderedForReading(novelId).stream()
                .map(chapterMapper::toListItem)
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
            return chapterMapper.toReadDto(chapter, content);
        });
    }

    // ── Opérations internes (seed) : travaillent au niveau entité. ──

    /** Nombre de chapitres en base (sert au seed idempotent). */
    public long count() {
        return chapterRepository.count();
    }

    /**
     * Crée un chapitre ET son texte (relation un-pour-un sur le même id).
     * Renvoie le chapitre persisté. Usage interne (seed / futur import).
     */
    @Transactional
    public Chapter createWithContent(Chapter chapter, String text, ContentFormat format) {
        // 1) on enregistre le chapitre → la base lui attribue un id.
        Chapter saved = chapterRepository.save(chapter);
        // 2) on enregistre le texte avec CE MÊME id (relation un-pour-un).
        chapterContentRepository.save(new ChapterContent(saved.getId(), text, format));
        return saved;
    }
}
