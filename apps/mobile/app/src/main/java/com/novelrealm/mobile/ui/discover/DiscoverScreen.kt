package com.novelrealm.mobile.ui.discover

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.novelrealm.mobile.ui.components.PlaceholderScreen

// Onglet Accueil / Découverte (#34, squelette). À venir : tendances, mises en avant,
// recommandations. Écran d'atterrissage par défaut.
@Composable
fun DiscoverScreen(modifier: Modifier = Modifier) {
    PlaceholderScreen(
        title = "Accueil",
        subtitle = "Bientôt : tendances, nouveautés et recommandations pour toi.",
        icon = Icons.Filled.Home,
        modifier = modifier,
    )
}
