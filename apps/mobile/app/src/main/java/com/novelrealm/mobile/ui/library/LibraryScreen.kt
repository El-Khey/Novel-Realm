package com.novelrealm.mobile.ui.library

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CollectionsBookmark
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.novelrealm.mobile.ui.components.PlaceholderScreen

// Onglet Bibliothèque (#34, squelette). À venir : les romans suivis par l'utilisateur,
// avec progression de lecture. Équivalent du « Library » de Mihon.
@Composable
fun LibraryScreen(modifier: Modifier = Modifier) {
    PlaceholderScreen(
        title = "Bibliothèque",
        subtitle = "Bientôt : retrouve ici tous les romans que tu suis.",
        icon = Icons.Filled.CollectionsBookmark,
        modifier = modifier,
    )
}
