package com.novelrealm.mobile.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.novelrealm.mobile.ui.theme.NovelRealmTheme

/**
 * Accueil de l'utilisateur **connecté** (#33). Salue par son pseudo et permet de se
 * déconnecter. L'indicateur de connectivité (#32) est conservé : une fois connecté,
 * l'appel `GET /api/novels` part désormais **avec le token** (visible en 200 dans les
 * logs), preuve que l'interceptor Bearer fonctionne. Sera enrichi par la nav (#34).
 */
@Composable
fun HomeScreen(
    pseudo: String?,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
    connectivityViewModel: ConnectivityViewModel = viewModel(),
) {
    val conn by connectivityViewModel.state.collectAsState()
    HomeContent(modifier = modifier, pseudo = pseudo, conn = conn, onLogout = onLogout)
}

@Composable
private fun HomeContent(
    pseudo: String?,
    conn: ConnState,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        NovelRealmWordmark()
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Bonjour ${pseudo ?: "lecteur"} 👋",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = "Tu es connecté·e à ton compte.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
        )

        Spacer(Modifier.height(24.dp))
        val (label, color) = when (conn) {
            ConnState.Loading -> "Vérification du backend…" to
                MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            ConnState.Reachable -> "✅ Backend joignable" to
                MaterialTheme.colorScheme.primary
            is ConnState.Unreachable -> "❌ Backend injoignable — ${conn.reason}" to
                MaterialTheme.colorScheme.error
        }
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = color)

        Spacer(Modifier.height(40.dp))
        OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
            Text("Se déconnecter")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun HomeScreenPreview() {
    NovelRealmTheme {
        HomeContent(pseudo = "Marwan", conn = ConnState.Reachable, onLogout = {})
    }
}
