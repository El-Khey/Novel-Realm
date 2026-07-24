package com.novelrealm.mobile.data.remote.dto

import kotlinx.serialization.Serializable

/** Miroir de `PageResponse<T>` (back) : enveloppe de pagination générique. */
@Serializable
data class PageDto<T>(
    val content: List<T> = emptyList(),
    val page: Int = 0,
    val size: Int = 0,
    val totalElements: Long = 0,
    val totalPages: Int = 0,
)
