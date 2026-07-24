package com.novelrealm.mobile.data.remote.api

import com.novelrealm.mobile.data.remote.dto.NovelDto
import com.novelrealm.mobile.data.remote.dto.PageDto
import retrofit2.http.GET
import retrofit2.http.Query

/** Endpoints des romans. `GET /api/novels` est authentifié (renvoie 401 sans token). */
interface NovelApi {

    @GET("api/novels")
    suspend fun getNovels(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20,
    ): PageDto<NovelDto>
}
