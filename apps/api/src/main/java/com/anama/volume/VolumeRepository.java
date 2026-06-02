package com.anama.volume;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Accès aux données des volumes.
 *
 * En plus des méthodes fournies (findById, save...), on déclare une "requête
 * dérivée" : Spring Data LIT le nom de la méthode et génère la requête SQL.
 *
 *   findByNovelIdOrderByVolumeNumber
 *   = SELECT * FROM volume WHERE novel_id = ? ORDER BY volume_number
 *
 * "Novel_Id" navigue dans la relation : volume.novel.id.
 */
public interface VolumeRepository extends JpaRepository<Volume, Long> {

    List<Volume> findByNovelIdOrderByVolumeNumber(Long novelId);
}
