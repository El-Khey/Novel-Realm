package com.novelrealm.mobile.data.remote

import retrofit2.HttpException
import java.io.IOException

/**
 * Résultat d'un appel réseau : succès typé, ou erreur. `code` est non-null quand
 * le serveur a répondu (ex. 401/404/500) et null quand le réseau est injoignable.
 */
sealed interface ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>
    data class Error(val code: Int?, val message: String) : ApiResult<Nothing>
}

/**
 * Enveloppe un appel Retrofit `suspend` et mappe les exceptions en [ApiResult] :
 * - [HttpException] → Error avec code (le serveur a répondu)
 * - [IOException]   → Error sans code (réseau injoignable / timeout)
 */
suspend fun <T> safeApiCall(block: suspend () -> T): ApiResult<T> =
    try {
        ApiResult.Success(block())
    } catch (e: HttpException) {
        ApiResult.Error(e.code(), e.message())
    } catch (e: IOException) {
        ApiResult.Error(null, e.message ?: "Réseau injoignable")
    } catch (e: Exception) {
        ApiResult.Error(null, e.message ?: "Erreur inconnue")
    }
