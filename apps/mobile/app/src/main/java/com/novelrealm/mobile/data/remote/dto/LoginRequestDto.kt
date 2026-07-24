package com.novelrealm.mobile.data.remote.dto

import kotlinx.serialization.Serializable

/** Corps de `POST /api/auth/login` (miroir de `LoginRequest` côté back). */
@Serializable
data class LoginRequestDto(
    val email: String,
    val password: String,
)
