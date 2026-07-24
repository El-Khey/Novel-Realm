package com.novelrealm.mobile.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.novelrealm.mobile.ui.theme.NovelRealmTheme

/**
 * Écran d'accueil provisoire. Depuis #32, affiche aussi l'état de connectivité au
 * backend (le « tuyau » réseau). Sera remplacé par la navigation (#34) et l'auth (#33).
 */
@Composable
fun WelcomeScreen(
    modifier: Modifier = Modifier,
    viewModel: ConnectivityViewModel = viewModel(),
) {
    val conn by viewModel.state.collectAsState()
    WelcomeContent(modifier = modifier, conn = conn)
}

@Composable
private fun WelcomeContent(
    modifier: Modifier = Modifier,
    conn: ConnState,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = buildAnnotatedString {
                withStyle(SpanStyle(color = MaterialTheme.colorScheme.onBackground)) { append("Novel") }
                withStyle(SpanStyle(color = MaterialTheme.colorScheme.primary)) { append("Realm") }
            },
            style = MaterialTheme.typography.displaySmall,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text = "Bienvenue — l'app mobile démarre ici 📚",
            style = MaterialTheme.typography.titleMedium,
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
    }
}

@Preview(showBackground = true)
@Composable
private fun WelcomeScreenPreview() {
    NovelRealmTheme {
        WelcomeContent(conn = ConnState.Reachable)
    }
}
