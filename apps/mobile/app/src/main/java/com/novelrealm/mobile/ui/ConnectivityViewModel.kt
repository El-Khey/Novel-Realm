package com.novelrealm.mobile.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.novelrealm.mobile.data.remote.ApiResult
import com.novelrealm.mobile.data.remote.safeApiCall
import com.novelrealm.mobile.di.ServiceLocator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** État du test de connectivité au backend (#32). */
sealed interface ConnState {
    data object Loading : ConnState
    data object Reachable : ConnState
    data class Unreachable(val reason: String) : ConnState
}

/**
 * Ping le backend au démarrage via `GET /api/novels`. L'endpoint est authentifié :
 * une réponse HTTP (même 401) prouve que le tuyau fonctionne (« joignable ») ;
 * seule une erreur SANS code HTTP signifie « injoignable » (réseau/URL).
 *
 * Dépendances via [ServiceLocator] (DI manuelle) → constructeur sans argument,
 * donc instanciable par `viewModel()` en Compose.
 */
class ConnectivityViewModel : ViewModel() {

    private val novelApi = ServiceLocator.novelApi

    private val _state = MutableStateFlow<ConnState>(ConnState.Loading)
    val state: StateFlow<ConnState> = _state.asStateFlow()

    init {
        check()
    }

    fun check() {
        _state.value = ConnState.Loading
        viewModelScope.launch {
            _state.value = when (val result = safeApiCall { novelApi.getNovels() }) {
                is ApiResult.Success -> ConnState.Reachable
                is ApiResult.Error ->
                    if (result.code != null) ConnState.Reachable          // le back a répondu (ex. 401)
                    else ConnState.Unreachable(result.message)
            }
        }
    }
}
