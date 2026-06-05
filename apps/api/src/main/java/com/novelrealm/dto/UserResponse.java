package com.novelrealm.dto;

import java.time.Instant;

public record UserResponse(Long id, String pseudo, String email, Instant createdAt) {}
