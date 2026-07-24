package com.novelrealm.mobile.data.remote.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * Miroir de `UserResponse` (back). `preferences` est du JSON opaque
 * (réglages) → gardé en `JsonElement`. Servira surtout à #33 (auth).
 */
@Serializable
data class UserDto(
    val id: Long,
    val pseudo: String,
    val email: String,
    val bio: String? = null,
    val avatarUrl: String? = null,
    val bannerUrl: String? = null,
    val provider: String? = null,
    val preferences: JsonElement? = null,
    val createdAt: String? = null,
)
