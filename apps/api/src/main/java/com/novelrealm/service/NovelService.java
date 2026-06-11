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

    // mettre ca en optional si il n'y'a pas de novel dans la bdd ? ou pas necessaire 
    public List<Novel> findAll() {
        return this.novelRepository.findAll();
    }
    
    public Novel findById(Long id) {
        return novelRepository.findById(id)
                .orElseThrow(() -> new NovelNotFoundException(id)); 
    }
    
}
