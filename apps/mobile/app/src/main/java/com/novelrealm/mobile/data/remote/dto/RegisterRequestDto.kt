package com.novelrealm.mobile.data.remote.dto

import kotlinx.serialization.Serializable

/**
 * Corps de `POST /api/auth/register` (miroir de `RegisterRequest` côté back).
 * Contraintes back : pseudo 3–30 caractères, email valide, mot de passe ≥ 8.
 */
@Serializable
data class RegisterRequestDto(
    val pseudo: String,
    val email: String,
    val password: String,
)
