package com.novelrealm.mobile.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.novelrealm.mobile.ui.NovelRealmWordmark
import com.novelrealm.mobile.ui.theme.NovelRealmTheme

/**
 * Écran d'inscription (#33). Les règles affichées (pseudo 3–30, mot de passe ≥ 8)
 * reflètent les contraintes de validation du back, pour éviter un aller-retour 400.
 * La validation stricte reste côté serveur ; ici on ne fait qu'un pré-contrôle doux.
 */
@Composable
fun RegisterScreen(
    form: AuthFormState,
    onSubmit: (pseudo: String, email: String, password: String) -> Unit,
    onSwitchToLogin: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var pseudo by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val pseudoValid = pseudo.trim().length in 3..30
    val passwordValid = password.length >= 8
    val canSubmit = pseudoValid && email.isNotBlank() && passwordValid && !form.isSubmitting

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        NovelRealmWordmark()
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Crée ton compte ✨",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
        )
        Spacer(Modifier.height(32.dp))

        AuthTextField(
            value = pseudo,
            onValueChange = { pseudo = it },
            label = "Pseudo (3 à 30 caractères)",
            imeAction = ImeAction.Next,
            enabled = !form.isSubmitting,
        )
        Spacer(Modifier.height(16.dp))
        AuthTextField(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Next,
            enabled = !form.isSubmitting,
        )
        Spacer(Modifier.height(16.dp))
        PasswordField(
            value = password,
            onValueChange = { password = it },
            label = "Mot de passe (8 caractères min.)",
            imeAction = ImeAction.Done,
            enabled = !form.isSubmitting,
        )

        if (form.error != null) {
            Spacer(Modifier.height(16.dp))
            ErrorBanner(form.error)
        }

        Spacer(Modifier.height(24.dp))
        SubmitButton(
            text = "Créer mon compte",
            onClick = { onSubmit(pseudo, email, password) },
            enabled = canSubmit,
            loading = form.isSubmitting,
        )

        Spacer(Modifier.height(8.dp))
        TextButton(
            onClick = onSwitchToLogin,
            enabled = !form.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Déjà un compte ? Se connecter")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun RegisterScreenPreview() {
    NovelRealmTheme {
        RegisterScreen(form = AuthFormState(), onSubmit = { _, _, _ -> }, onSwitchToLogin = {})
    }
}
