package com.novelrealm.mobile.di

import android.content.Context
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.novelrealm.mobile.BuildConfig
import com.novelrealm.mobile.data.local.TokenStorage
import com.novelrealm.mobile.data.remote.AuthInterceptor
import com.novelrealm.mobile.data.remote.api.AuthApi
import com.novelrealm.mobile.data.remote.api.NovelApi
import com.novelrealm.mobile.data.repository.AuthRepository
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
 * manuelle est simple et suffisante.
 *
 * [init] doit être appelé une fois au démarrage (depuis [com.novelrealm.mobile.NovelRealmApp])
 * pour fournir le `Context` applicatif nécessaire au stockage sécurisé.
 */
object ServiceLocator {

    private lateinit var appContext: Context

    /** À appeler dans `Application.onCreate()`. */
    fun init(context: Context) {
        appContext = context.applicationContext
    }

    // ── Stockage sécurisé du token (#33) ──
    val tokenStorage: TokenStorage by lazy { TokenStorage(appContext) }

    // ── Réseau ──
    private val json: Json by lazy {
        Json {
            ignoreUnknownKeys = true   // tolère les champs inconnus (ex. `token` aplati du login)
            isLenient = true
        }
    }

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenStorage))   // injecte le Bearer sur les appels authentifiés
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

    // ── APIs & repositories ──
    val novelApi: NovelApi by lazy { retrofit.create(NovelApi::class.java) }
    private val authApi: AuthApi by lazy { retrofit.create(AuthApi::class.java) }

    val authRepository: AuthRepository by lazy { AuthRepository(authApi, tokenStorage) }
}
