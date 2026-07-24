package com.novelrealm.mobile.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Stockage sécurisé du JWT (#33).
 *
 * Le token est écrit dans des `EncryptedSharedPreferences` : le contenu du fichier
 * est chiffré (AES) par une clé maître conservée dans l'**Android Keystore**, donc
 * le token n'est jamais lisible en clair sur le disque, même sur un appareil rooté.
 *
 * Lecture/écriture **défensive** : si le fichier chiffré devient illisible (clé
 * absente après restauration d'une sauvegarde, corruption…), on le réinitialise
 * plutôt que de laisser l'app crasher — l'utilisateur devra simplement se reconnecter.
 */
class TokenStorage(private val context: Context) {

    private val prefs: SharedPreferences by lazy { openPrefs() }

    /** Mémorise la session après un login réussi. */
    fun saveSession(token: String, pseudo: String?) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_PSEUDO, pseudo)
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    /** Pseudo mémorisé, pour saluer l'utilisateur sans rappeler l'API au démarrage. */
    fun getPseudo(): String? = prefs.getString(KEY_PSEUDO, null)

    fun hasToken(): Boolean = !getToken().isNullOrBlank()

    /** Déconnexion : oublie tout. */
    fun clear() {
        prefs.edit().clear().apply()
    }

    private fun openPrefs(): SharedPreferences =
        try {
            createEncryptedPrefs()
        } catch (e: Exception) {
            // Fichier chiffré illisible → on repart d'une base propre.
            context.deleteSharedPreferences(FILE_NAME)
            createEncryptedPrefs()
        }

    private fun createEncryptedPrefs(): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            context,
            FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    private companion object {
        const val FILE_NAME = "novelrealm_secure_prefs"
        const val KEY_TOKEN = "jwt_token"
        const val KEY_PSEUDO = "user_pseudo"
    }
}
