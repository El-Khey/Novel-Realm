package com.novelrealm.mobile.data.remote.api

import com.novelrealm.mobile.data.remote.dto.LoginRequestDto
import com.novelrealm.mobile.data.remote.dto.LoginResponseDto
import com.novelrealm.mobile.data.remote.dto.RegisterRequestDto
import com.novelrealm.mobile.data.remote.dto.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

// Endpoints d'authentification (/api/auth/** publics côté back).
//
// Note : `register` renvoie l'utilisateur créé « sans token » (201) ; c'est
// l'AuthRepository qui enchaîne un `login` pour obtenir le JWT.
interface AuthApi {

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequestDto): UserDto

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequestDto): LoginResponseDto

    // 204 No Content : Retrofit renvoie une réponse vide sans désérialiser de corps.
    @POST("api/auth/logout")
    suspend fun logout(): Response<Unit>
}
