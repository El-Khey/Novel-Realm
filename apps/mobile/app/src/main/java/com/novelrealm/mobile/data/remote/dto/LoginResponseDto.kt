package com.novelrealm.mobile.data.remote.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * Réponse de `POST /api/auth/login`. Côté back, `LoginResponse` **aplatit** les
 * champs de l'utilisateur à la racine du JSON (via `@JsonUnwrapped`) et y ajoute
 * `token`. On mappe donc les champs utilisateur directement au même niveau que
 * `token`, plutôt que dans un objet imbriqué.
 */
@Serializable
data class LoginResponseDto(
    val id: Long,
    val pseudo: String,
    val email: String,
    val bio: String? = null,
    val avatarUrl: String? = null,
    val bannerUrl: String? = null,
    val provider: String? = null,
    val preferences: JsonElement? = null,
    val createdAt: String? = null,
    val token: String,
)
