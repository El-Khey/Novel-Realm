package com.novelrealm.mobile.data.repository

import com.novelrealm.mobile.data.local.TokenStorage
import com.novelrealm.mobile.data.remote.ApiResult
import com.novelrealm.mobile.data.remote.api.AuthApi
import com.novelrealm.mobile.data.remote.dto.LoginRequestDto
import com.novelrealm.mobile.data.remote.dto.RegisterRequestDto
import com.novelrealm.mobile.data.remote.safeApiCall

/**
 * Point d'entrée unique pour l'authentification (#33). Cache la mécanique réseau +
 * stockage du token au reste de l'app : les écrans/ViewModels ne manipulent que des
 * [ApiResult].
 */
class AuthRepository(
    private val authApi: AuthApi,
    private val tokenStorage: TokenStorage,
) {

    /** Vrai si un token est mémorisé (session ouverte au lancement de l'app). */
    fun isLoggedIn(): Boolean = tokenStorage.hasToken()

    /** Pseudo mémorisé lors du dernier login (pour l'affichage). */
    fun currentPseudo(): String? = tokenStorage.getPseudo()

    /** Connexion : récupère le JWT et le mémorise. */
    suspend fun login(email: String, password: String): ApiResult<Unit> =
        when (val result = safeApiCall {
            authApi.login(LoginRequestDto(email = email.trim(), password = password))
        }) {
            is ApiResult.Success -> {
                tokenStorage.saveSession(result.data.token, result.data.pseudo)
                ApiResult.Success(Unit)
            }
            is ApiResult.Error -> result
        }

    /**
     * Inscription puis **auto-login** : l'endpoint `register` ne renvoie pas de
     * token (juste l'utilisateur créé), on enchaîne donc un `login` avec les mêmes
     * identifiants pour ouvrir la session directement.
     */
    suspend fun register(pseudo: String, email: String, password: String): ApiResult<Unit> {
        val registration = safeApiCall {
            authApi.register(RegisterRequestDto(pseudo = pseudo.trim(), email = email.trim(), password = password))
        }
        return when (registration) {
            is ApiResult.Error -> registration
            is ApiResult.Success -> login(email, password)
        }
    }

    /**
     * Déconnexion : on prévient le back (best-effort, il efface le cookie web) puis
     * on jette le token local — le résultat de l'appel réseau n'est pas bloquant.
     */
    suspend fun logout() {
        safeApiCall { authApi.logout() }
        tokenStorage.clear()
    }
}
