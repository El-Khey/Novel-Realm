# NovelRealm — App mobile

Application **Android native** (Kotlin + Jetpack Compose) qui consomme le backend Spring de NovelRealm (`/api/**`). Fait partie de l'initiative mobile (epic **#35** du repo `El-Khey/Novel-Realm`).

## Stack

- **Kotlin** 2.2.10 · **Jetpack Compose** + Material 3
- **AGP** 9.1.1 / **Gradle** 9.3.1 — Kotlin intégré à AGP (pas de plugin `kotlin-android`)
- **minSdk** 26 (Android 8.0) · **compileSdk / targetSdk** 36
- Archi cible : MVVM (ViewModel + StateFlow) · Repository · DI **Hilt** (arrive avec #32)

## Prérequis

- Android Studio 2025.3.2+ (embarque AGP 9)
- SDK Android **API 36** + build-tools 36.x
- Un émulateur (ex. API 36) **ou** un appareil physique en mode développeur

## Lancer

1. Ouvrir le dossier dans Android Studio, laisser le **sync Gradle** se faire.
2. Choisir un émulateur ou brancher un téléphone (débogage USB activé).
3. **Run ▶️** → l'écran d'accueil « Novel**Realm** » (rose de marque) s'affiche.

> `local.properties` (chemin du SDK, propre à la machine) est **gitignoré** — ne pas le committer.

## Structure

```
app/src/main/java/com/novelrealm/mobile/
├── MainActivity.kt          # point d'entrée : pose le thème + l'écran
└── ui/
    ├── WelcomeScreen.kt      # écran d'accueil provisoire (bootstrap)
    └── theme/                # Color / Theme / Type — identité NovelRealm
```

À venir : `data/` (réseau, DTOs, repositories — #32), `di/` (Hilt — #32), écrans d'auth (#33), navigation (#34).

## Réseau (à venir — #32)

Depuis l'émulateur, le backend se joint via **`http://10.0.2.2:8080`** (émulateur → localhost de l'hôte → forwarding WSL2 → docker). Authentification par **JWT** (`Authorization: Bearer <token>`).
