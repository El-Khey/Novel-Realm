package com.novelrealm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.novelrealm.model.Novel;

public interface NovelRepository extends JpaRepository<Novel, Long> {
}
