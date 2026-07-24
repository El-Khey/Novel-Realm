package com.novelrealm.mobile.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

/**
 * Logotype « **Novel**Realm » bicolore (onBackground + primary), réutilisé sur les
 * écrans d'auth et l'accueil.
 */
@Composable
fun NovelRealmWordmark(
    modifier: Modifier = Modifier,
    style: TextStyle = MaterialTheme.typography.displaySmall,
) {
    Text(
        modifier = modifier,
        text = buildAnnotatedString {
            withStyle(SpanStyle(color = MaterialTheme.colorScheme.onBackground)) { append("Novel") }
            withStyle(SpanStyle(color = MaterialTheme.colorScheme.primary)) { append("Realm") }
        },
        style = style.copy(fontWeight = FontWeight.Bold),
    )
}
