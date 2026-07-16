# =====================================================================
#  Makefile : raccourcis pour piloter Docker sans retenir les longues
#  commandes compose. Tape simplement `make <cible>`.
#  (Utilise le plugin Docker Compose v2 → commande "docker compose".)
# =====================================================================

# La commande compose et les combinaisons de fichiers pour chaque mode.
# "-p novelrealm" fixe le NOM DE PROJET Compose : il sert de préfixe aux
# conteneurs, volumes et réseau (novelrealm_postgres_data, etc.). Sans lui,
# Compose prendrait le nom du dossier courant — on le fige donc explicitement.
COMPOSE := docker compose -p novelrealm
DEV     := -f docker-compose.yml -f docker-compose.dev.yml
PROD    := -f docker-compose.yml

# Nombre max de chapitres importés par `make ingest` (surchargeable : MAX=...).
MAX     ?= 50

# Cible par défaut quand on tape juste `make` : afficher l'aide.
.DEFAULT_GOAL := help

.PHONY: help dev prod down logs ps db restart-api rebuild clean ingest

help:  ## Affiche cette aide
	@echo ""
	@echo "  Novel Realm — commandes Docker"
	@echo "  ------------------------"
	@echo "  make dev          Mode DEV (hot-reload, code monté en volume) — en arrière-plan"
	@echo "  make prod         Mode PROD (images figées) — en arrière-plan"
	@echo "  make down         Arrête et supprime les conteneurs"
	@echo "  make logs         Affiche les logs en continu"
	@echo "  make ps           Liste l'état des conteneurs"
	@echo "  make db           Démarre UNIQUEMENT la base (utile si on lance l'app à la main)"
	@echo "  make restart-api  Redémarre l'API (applique un changement back en dev)"
	@echo "  make rebuild      Reconstruit les images dev sans cache"
	@echo "  make clean        Arrête tout ET supprime les volumes (DONNÉES DB PERDUES)"
	@echo "  make ingest SLUG=<slug> [MAX=50]   Importe un roman LightNovelWorld (one-shot)"
	@echo ""
	@echo "  App : http://localhost:5173   API : http://localhost:8080"
	@echo ""

dev:  ## Lance la stack en mode développement (hot-reload), en arrière-plan
	$(COMPOSE) $(DEV) up --build -d
	@echo "Lancé (dev / hot-reload). App : http://localhost:5173   API : http://localhost:8080"
	@echo "Suivre les logs : make logs    |    Arrêter : make down"

prod:  ## Lance la stack en mode production (détaché)
	$(COMPOSE) $(PROD) up --build -d
	@echo "Lancé. App : http://localhost:5173   API : http://localhost:8080"

down:  ## Arrête et supprime les conteneurs
	$(COMPOSE) $(DEV) down

logs:  ## Suit les logs de tous les services
	$(COMPOSE) $(DEV) logs -f

ps:  ## État des conteneurs
	$(COMPOSE) $(DEV) ps

db:  ## Démarre seulement PostgreSQL
	$(COMPOSE) up -d postgres

restart-api:  ## Redémarre l'API (applique un changement backend en dev)
	$(COMPOSE) $(DEV) restart api

rebuild:  ## Reconstruit les images dev de zéro (sans cache)
	$(COMPOSE) $(DEV) build --no-cache

clean:  ## Arrête tout et SUPPRIME les volumes (efface la base !)
	$(COMPOSE) $(DEV) down -v

ingest:  ## Importe un roman LightNovelWorld (ex: make ingest SLUG=shadow-slave [MAX=100])
	@test -n "$(SLUG)" || { echo "Usage : make ingest SLUG=<slug> [MAX=50]   (slug = .../novel/<slug>/)"; exit 1; }
	@echo "Ingestion one-shot de '$(SLUG)' (max $(MAX) chapitres)…"
	# L'API `dev` tourne déjà et tient les verrous Gradle. Pour coexister sans
	# conflit, l'ingestion utilise des caches Gradle DÉDIÉS (un volume à elle) :
	#   - GRADLE_USER_HOME=/gradle-ingest  → cache global (deps) séparé de /root/.gradle
	#   - --project-cache-dir              → cache PROJET séparé de /app/.gradle (monté)
	# Sans ça : "Timeout waiting to lock ... It is currently in use by another Gradle instance".
	$(COMPOSE) $(DEV) run --rm \
		-e SPRING_PROFILES_ACTIVE=dev,ingest \
		-e NOVELREALM_INGESTION_SLUG=$(SLUG) \
		-e NOVELREALM_INGESTION_MAX_CHAPTERS=$(MAX) \
		-e GRADLE_USER_HOME=/gradle-ingest \
		-v novelrealm_gradle_ingest:/gradle-ingest \
		api ./gradlew bootRun --no-daemon --project-cache-dir /gradle-ingest/project-cache
