package com.novelrealm.mobile

import android.app.Application
import com.novelrealm.mobile.di.ServiceLocator

/**
 * `Application` de l'app. Son seul rôle : donner au [ServiceLocator] le `Context`
 * applicatif au démarrage (nécessaire au stockage sécurisé du token). Ce n'est
 * PAS Hilt — juste un point d'initialisation manuel.
 */
class NovelRealmApp : Application() {
    override fun onCreate() {
        super.onCreate()
        ServiceLocator.init(this)
    }
}
