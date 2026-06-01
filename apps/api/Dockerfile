# =====================================================================
#  Dockerfile de PRODUCTION pour l'API (build "multi-stage").
#  But : produire une image finale légère qui ne contient QUE le jar et
#  un JRE (pas tout le JDK ni Gradle). On build dans une 1re étape, puis
#  on ne copie que le résultat dans une 2e étape minimale.
# =====================================================================

# ---- Étape 1 : compilation (a besoin du JDK complet + Gradle) -------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# On copie d'abord SEULEMENT les fichiers de build. Tant qu'ils ne
# changent pas, Docker réutilise le cache de téléchargement des
# dépendances (étape lente) au lieu de tout refaire à chaque modif de code.
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# Puis le code source, et on construit le jar exécutable.
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# ---- Étape 2 : image finale d'exécution (JRE seul, plus léger) ------
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# On récupère uniquement le jar produit à l'étape précédente.
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
