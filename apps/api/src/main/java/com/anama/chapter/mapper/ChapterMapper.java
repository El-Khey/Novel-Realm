package com.anama.chapter.mapper;

import com.anama.chapter.domain.Chapter;
import com.anama.chapter.domain.ChapterContent;
import com.anama.chapter.dto.ChapterListItemDto;
import com.anama.chapter.dto.ChapterReadDto;
import com.anama.volume.domain.Volume;
import org.springframework.stereotype.Component;

/**
 * Traduction des entités chapitre → DTO.
 *
 * ATTENTION (important à comprendre) : ces méthodes accèdent à des relations
 * LAZY (chapter.getVolume(), volume.getNovel()). Elles ne sont donc valides que
 * si on les appelle DANS une méthode @Transactional du service. C'est le cas :
 * le service appelle le mapper avant de rendre la main. Hors transaction, ces
 * accès lèveraient une LazyInitializationException.
 */
@Component
public class ChapterMapper {

    /** Une ligne de la liste des chapitres (sans le texte). */
    public ChapterListItemDto toListItem(Chapter c) {
        Volume v = c.getVolume(); // déjà chargé par le "join fetch" de la requête
        return new ChapterListItemDto(
                c.getId(),
                c.getOrdinal(),
                c.getChapterNumber(),
                c.getTitle(),
                v.getVolumeNumber(),
                v.getTitle());
    }

    /** Le chapitre complet (métadonnées + texte) pour la lecture. */
    public ChapterReadDto toReadDto(Chapter chapter, ChapterContent content) {
        Volume volume = chapter.getVolume();
        return new ChapterReadDto(
                chapter.getId(),
                volume.getNovel().getId(),
                chapter.getChapterNumber(),
                chapter.getTitle(),
                content != null ? content.getContent() : null,
                content != null ? content.getContentFormat() : null);
    }
}
