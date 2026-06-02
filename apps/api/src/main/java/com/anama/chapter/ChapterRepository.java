package com.anama.chapter;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès aux données des chapitres.
 *
 * Ici la requête traverse DEUX relations (chapter → volume → novel), donc on
 * l'écrit nous-mêmes en JPQL (le langage de requête objet de JPA, qui parle
 * d'entités et de champs, pas de colonnes SQL).
 *
 * Lecture de la requête :
 *   - "from Chapter c"            : on part des chapitres
 *   - "join fetch c.volume v"     : on charge le volume EN MÊME TEMPS (1 seule
 *                                   requête au lieu d'une par chapitre = évite
 *                                   le problème "N+1").
 *   - "where v.novel.id = :id"    : dont le roman (via le volume) a cet id
 *   - "order by v.volumeNumber, c.ordinal" : ordre de lecture global
 *     (d'abord par tome, puis par position dans le tome).
 */
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    @Query("""
            select c
            from Chapter c
            join fetch c.volume v
            where v.novel.id = :novelId
            order by v.volumeNumber, c.ordinal
            """)
    List<Chapter> findByNovelOrderedForReading(@Param("novelId") Long novelId);
}
