package com.novelrealm.mobile.ui.main

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.novelrealm.mobile.ui.discover.DiscoverScreen
import com.novelrealm.mobile.ui.explore.ExploreScreen
import com.novelrealm.mobile.ui.history.HistoryScreen
import com.novelrealm.mobile.ui.library.LibraryScreen
import com.novelrealm.mobile.ui.profile.ProfileScreen

// Coquille principale de l'app connectée (#34) : une barre de navigation Material 3 en
// bas + un NavHost qui affiche l'onglet courant. Comportement calqué sur Mihon : re-tap
// sur l'onglet actif ne re-navigue pas, et l'état de chaque onglet est préservé quand on
// bascule (saveState / restoreState).
@Composable
fun MainScreen(
    pseudo: String?,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val navController = rememberNavController()

    Scaffold(
        modifier = modifier,
        bottomBar = {
            NavigationBar {
                val backStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = backStackEntry?.destination?.route

                TopLevelDestination.entries.forEach { destination ->
                    val selected = currentRoute == destination.route
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            if (!selected) {
                                navController.navigate(destination.route) {
                                    // Revenir à l'onglet de départ en mémorisant l'état,
                                    // sans empiler les onglets dans le back stack.
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        },
                        icon = { Icon(destination.icon, contentDescription = destination.label) },
                        label = {
                            Text(
                                text = destination.label,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        },
                        alwaysShowLabel = true,
                    )
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = TopLevelDestination.Discover.route,
            modifier = Modifier.padding(innerPadding),
        ) {
            composable(TopLevelDestination.Discover.route) { DiscoverScreen() }
            composable(TopLevelDestination.Explore.route) { ExploreScreen() }
            composable(TopLevelDestination.Library.route) { LibraryScreen() }
            composable(TopLevelDestination.History.route) { HistoryScreen() }
            composable(TopLevelDestination.Profile.route) {
                ProfileScreen(pseudo = pseudo, onLogout = onLogout)
            }
        }
    }
}
