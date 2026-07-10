package com.novelrealm.service;

import com.novelrealm.repository.LibraryEntryRepository;


public class LibraryEntryService {
    private final LibraryEntryRepository libraryEntryRepository;

    public LibraryEntryService(LibraryEntryRepository libraryEntryRepository) {
        this.libraryEntryRepository = libraryEntryRepository;
    }

    public void addLibraryEntry(Long userId, Long novelId) {
        libraryEntryRepository.addLibraryEntry(userId, novelId);
    }

    

}
