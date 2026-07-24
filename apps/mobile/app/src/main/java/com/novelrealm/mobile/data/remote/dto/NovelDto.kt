package com.novelrealm.mobile.data.remote.dto

import kotlinx.serialization.Serializable

/**
 * Miroir de `NovelResponse` (back). `status` et `createdAt` sont gardés en
 * String (pas besoin de l'enum ni d'un serializer Instant pour l'affichage).
 */
@Serializable
data class NovelDto(
    val id: Long,
    val title: String,
    val author: String? = null,
    val description: String? = null,
    val coverImageUrl: String? = null,
    val status: String? = null,
    val createdAt: String? = null,
)
