package com.novelrealm.repository;

import com.novelrealm.model.LibraryEntry;
import com.novelrealm.model.LibraryEntryId;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, LibraryEntryId> {
    void addLibraryEntry(Long userId, Long novelId);
}
