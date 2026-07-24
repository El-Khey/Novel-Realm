package com.novelrealm.mobile.ui.explore

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.novelrealm.mobile.ui.components.PlaceholderScreen

// Onglet Explorer / Catalogue (#34, squelette). À venir : parcours du catalogue du
// backend + recherche + filtres. Équivalent du « Browse » de Mihon.
@Composable
fun ExploreScreen(modifier: Modifier = Modifier) {
    PlaceholderScreen(
        title = "Explorer",
        subtitle = "Bientôt : parcourir et rechercher tout le catalogue de romans.",
        icon = Icons.Filled.Explore,
        modifier = modifier,
    )
}
