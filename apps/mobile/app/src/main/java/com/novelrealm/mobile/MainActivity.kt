package com.novelrealm.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.novelrealm.mobile.ui.AppRoot
import com.novelrealm.mobile.ui.theme.NovelRealmTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NovelRealmTheme {
                // AppRoot aiguille vers le flux d'auth ou la coquille à onglets (MainScreen),
                // chacun gérant ses propres insets système → pas de Scaffold ici (éviter le
                // double Scaffold imbriqué).
                AppRoot()
            }
        }
    }
}
