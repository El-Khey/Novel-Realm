package com.novelrealm.mobile.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = NovelRose,
    onPrimary = Color.White,
    primaryContainer = NovelRoseActive,
    onPrimaryContainer = Color.White,
    secondary = NovelRoseLight,
    onSecondary = Color.White,
    background = NovelBackgroundDark,
    onBackground = OnDark,
    surface = NovelSurfaceDark,
    onSurface = OnDark,
    surfaceVariant = NovelSurfaceVariantDark,
)

private val LightColorScheme = lightColorScheme(
    primary = NovelRose,
    onPrimary = Color.White,
    primaryContainer = NovelRoseContainerLight,
    onPrimaryContainer = NovelRoseActive,
    secondary = NovelRoseActive,
    onSecondary = Color.White,
    background = NovelBackgroundLight,
    onBackground = OnLight,
    surface = NovelSurfaceLight,
    onSurface = OnLight,
    surfaceVariant = NovelSurfaceVariantLight,
)

@Composable
fun NovelRealmTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Couleur dynamique (Material You) DÉSACTIVÉE volontairement : on veut l'identité
    // NovelRealm (le rose de la marque), pas les couleurs du fond d'écran de l'appareil.
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
