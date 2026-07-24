package com.novelrealm.mobile.data.remote

import com.novelrealm.mobile.data.local.TokenStorage
import okhttp3.Interceptor
import okhttp3.Response

// Ajoute l'en-tête `Authorization: Bearer <token>` à chaque requête, dès qu'un
// token est mémorisé (#33). C'est ce qui rend l'app « connectée » : le back valide
// ce token via son filtre JWT.
//
// Les endpoints publics d'auth (/api/auth/** : login, register, logout) sont
// exclus — ils n'exigent pas de token et ne doivent pas être perturbés par un
// token éventuellement périmé.
class AuthInterceptor(private val tokenStorage: TokenStorage) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenStorage.getToken()
        val isAuthEndpoint = request.url.encodedPath.contains("/api/auth/")

        if (token.isNullOrBlank() || isAuthEndpoint) {
            return chain.proceed(request)
        }

        val authenticated = request.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
        return chain.proceed(authenticated)
    }
}
