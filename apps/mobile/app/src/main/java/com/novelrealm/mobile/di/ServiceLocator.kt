package com.novelrealm.mobile.di

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.novelrealm.mobile.BuildConfig
import com.novelrealm.mobile.data.remote.api.NovelApi
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit

/**
 * DI manuelle (ServiceLocator) : construit le graphe réseau paresseusement.
 *
 * On n'utilise PAS Hilt : son plugin Gradle n'est pas compatible AGP 9
 * (« Android BaseExtension not found »). Pour un projet de cette taille, une DI
 * manuelle est simple et suffisante. Migration possible plus tard si Hilt
 * publie un support AGP 9. L'interceptor Bearer (auth) s'ajoutera ici en #33.
 */
object ServiceLocator {

    private val json: Json by lazy {
        Json {
            ignoreUnknownKeys = true   // tolère les champs inconnus (ex. `token` aplati du login)
            isLenient = true
        }
    }

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(
                HttpLoggingInterceptor().apply {
                    level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                    else HttpLoggingInterceptor.Level.NONE
                }
            )
            .build()
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
    }

    val novelApi: NovelApi by lazy { retrofit.create(NovelApi::class.java) }
}
