package com.anama.volume.mapper;

import com.anama.volume.domain.Volume;
import com.anama.volume.dto.VolumeDto;
import org.springframework.stereotype.Component;

/**
 * Traduction entité Volume → DTO. Même rôle que NovelMapper : isoler la recopie
 * de champs hors du service.
 */
@Component
public class VolumeMapper {

    public VolumeDto toDto(Volume v) {
        return new VolumeDto(v.getId(), v.getVolumeNumber(), v.getTitle());
    }
}
