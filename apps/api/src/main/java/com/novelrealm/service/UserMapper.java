package com.novelrealm.service;

import com.novelrealm.dto.UserResponse;
import com.novelrealm.model.User;

import org.springframework.stereotype.Component;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Entité {@link User} → {@link UserResponse}. Centralisé ici car la conversion
 * des préférences (String JSON en base → arbre JSON dans la réponse) demande un
 * {@link ObjectMapper}, et le DTO est construit depuis plusieurs controllers.
 */
@Component
public class UserMapper {

    private final ObjectMapper objectMapper;

    public UserMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /** Réponse complète, préférences incluses — pour l'utilisateur lui-même. */
    public UserResponse toOwnResponse(User user) {
        return toResponse(user, true);
    }

    /** Réponse « publique » : mêmes champs mais sans les préférences. */
    public UserResponse toPublicResponse(User user) {
        return toResponse(user, false);
    }

    private UserResponse toResponse(User user, boolean includePreferences) {
        return new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getBannerUrl(),
                user.getProvider(),
                includePreferences ? parsePreferences(user.getPreferences()) : null,
                user.getCreatedAt());
    }

    /** JSON stocké → arbre Jackson (null si absent ou illisible). */
    private JsonNode parsePreferences(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(raw);
        } catch (Exception e) {
            return null; // préférences corrompues : on les ignore plutôt que de casser /me
        }
    }
}
