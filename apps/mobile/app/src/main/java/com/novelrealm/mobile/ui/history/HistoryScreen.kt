package com.novelrealm.mobile.ui.history

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.novelrealm.mobile.ui.components.PlaceholderScreen

// Onglet Historique (#34, squelette). À venir : les lectures récentes pour reprendre
// là où on s'est arrêté. Équivalent du « History » de Mihon.
@Composable
fun HistoryScreen(modifier: Modifier = Modifier) {
    PlaceholderScreen(
        title = "Historique",
        subtitle = "Bientôt : reprends ta lecture là où tu t'es arrêté·e.",
        icon = Icons.Filled.History,
        modifier = modifier,
    )
}
