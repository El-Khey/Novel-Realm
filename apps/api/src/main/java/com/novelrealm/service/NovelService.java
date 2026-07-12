package com.novelrealm.service;

import com.novelrealm.model.Novel;
import com.novelrealm.repository.NovelRepository;
import com.novelrealm.exception.NovelNotFoundException;

import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class NovelService {
    private final NovelRepository novelRepository;

    public NovelService(NovelRepository novelRepository) {
        this.novelRepository = novelRepository;
    }   

    public List<Novel> findAll() {
        return this.novelRepository.findAll();
    }

    /** Romans d'un genre donné (pour le filtre du catalogue). */
    public List<Novel> findByGenre(Long genreId) {
        return this.novelRepository.findByGenres_Id(genreId);
    }

    public Novel findById(Long id) {
        return novelRepository.findById(id)
                .orElseThrow(() -> new NovelNotFoundException(id));
    }
    
}
