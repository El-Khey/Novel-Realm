package com.anama.volume.service;

import com.anama.volume.domain.Volume;
import com.anama.volume.dto.VolumeDto;
import com.anama.volume.mapper.VolumeMapper;
import com.anama.volume.repository.VolumeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique métier des tomes.
 *
 * Symétrique des autres features : lecture (liste des tomes d'un roman, en DTO)
 * + une opération interne de création utilisée par le seed (au niveau entité).
 */
@Service
@Transactional(readOnly = true)
public class VolumeService {

    private final VolumeRepository volumeRepository;
    private final VolumeMapper volumeMapper;

    public VolumeService(VolumeRepository volumeRepository, VolumeMapper volumeMapper) {
        this.volumeRepository = volumeRepository;
        this.volumeMapper = volumeMapper;
    }

    /** Les tomes d'un roman, ordonnés par numéro, en DTO. */
    public List<VolumeDto> listByNovel(Long novelId) {
        return volumeRepository.findByNovelIdOrderByVolumeNumber(novelId).stream()
                .map(volumeMapper::toDto)
                .toList();
    }

    // ── Opération interne (seed) : travaille au niveau entité. ─────
    @Transactional
    public Volume create(Volume volume) {
        return volumeRepository.save(volume);
    }
}
