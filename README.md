# Novel Realm

> A self-hosted webnovel reader & aggregator — built as a full-stack learning project.

Novel Realm is a personal project to build a clean, modern application for reading
webnovels. The long-term goal is an **aggregator**: fetch novels and chapters from
third-party web sources that you configure, organize them into a personal library,
and read them in a distraction-free reader that remembers where you left off — with
a **local mode** (import and read your own files, fully offline) planned later.

It is **not** a race to ship features. The real goal is to **become a better
developer**: understand *why* each decision is made, learn solid engineering
practices, and make real architecture choices. A detailed, beginner-friendly guide
to the whole setup (in French) lives in [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

---

## ⚠️ Disclaimer

Novel Realm is a personal, self-hosted project built primarily as a **learning
exercise**. It fetches and displays webnovels from **third-party sources that the
user configures** — it ships with no content of its own and is not affiliated with
any source. Any content it caches or imports locally is the responsibility of the
user who set up that source.

Use it for **personal use only**. Respect the copyright of authors and publishers,
follow the terms of service of any source you connect it to, and **support official
releases** whenever they are available. It is **your** responsibility to ensure that
connecting Novel Realm to a given source — and reading what it returns — is legal in
your jurisdiction and compliant with that source's terms. The author is not
responsible for how this software is used.

---

## Features

The project is early-stage. The list below separates what works today from where
it's headed.

### ✅ Available now
- **Dockerized full-stack skeleton** — PostgreSQL + Spring Boot API + React/Vite web,
  orchestrated by Docker Compose with two modes (dev hot-reload / production images).
- **End-to-end health check** — `GET /api/ping` served by Spring and reachable from
  the browser through configured CORS.
- **SQL-managed schema** — the database schema is created from plain SQL scripts in
  [db/init/](db/init/), run automatically by Postgres on first boot.

### 🚧 In progress
- **User accounts foundation** — `users` table and the first persistence layer
  (model · repository · service).

### 🗺️ Planned
- **Sources & aggregation** — pluggable source adapters to fetch novels and chapters
  from third-party web sources; automatic detection of newly published chapters.
- **Library** — browse, search, and filter by genre, tag, and status, with covers.
- **Reader** — distraction-free reading view, previous/next navigation, adjustable
  font size, and light/dark themes.
- **Reading progress** — auto-save and resume exactly where you stopped.
- **Collections** — favorites, bookmarks, custom reading lists, and "continue reading".
- **Accounts** — multi-user with authentication; per-user library and progress.
- **Local mode** *(later)* — import your own files (EPUB/TXT), download chapters, and
  read fully offline.
- **Notifications** — new-chapter alerts for novels you follow.
- **Polish** — global error handling, input validation, full-text search, and tests.

---

## Tech stack (and why)

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | **Java 21 + Spring Boot + Spring Data JPA** | Industry-standard backend stack — teaches dependency injection, layered architecture, and ORM. |
| Build tool (API) | **Gradle** (with wrapper) | `./gradlew` runs the pinned Gradle version with no manual install. |
| Frontend | **React + TypeScript + Tailwind CSS** | React dominates UI work; TypeScript adds type safety; Tailwind keeps styling fast and consistent. |
| Build/dev tool (web) | **Vite** | Fast, modern dev server and bundler with hot module replacement. |
| Database | **PostgreSQL 16** | A robust relational database — our data (novels, chapters, genres, progress) is highly relational. |
| Schema | **Plain SQL init scripts** ([db/init/](db/init/)) | Simple, explicit schema managed by hand and run automatically on first boot. No migration tool until a real need appears. |
| Infrastructure | **Docker Compose** | Reproducible environment — anyone gets the same stack with one command. |

> Exact pinned versions are the source of truth in
> [apps/api/build.gradle](apps/api/build.gradle) and
> [apps/web/package.json](apps/web/package.json) — refer to those rather than
> hard-coding versions here.

We deliberately keep the toolbox small and add things only when a real need appears.

---

## Architecture

This is a **monorepo**: backend and frontend live side by side.

```
novel-realm/
├── apps/
│   ├── api/                  → Spring Boot backend (REST API, Java)
│   │   ├── build.gradle          (dependencies + Java version)
│   │   ├── Dockerfile            (prod: multi-stage JDK build → slim JRE)
│   │   ├── Dockerfile.dev        (dev: gradle bootRun, code mounted as a volume)
│   │   └── src/main/
│   │       ├── java/com/novelrealm/   (feature-by-package: config, ping, models, repository, service…)
│   │       └── resources/application.yml
│   └── web/                  → React + TypeScript frontend
│       ├── Dockerfile            (prod: Vite build → nginx)
│       ├── Dockerfile.dev        (dev: Vite dev server with HMR)
│       ├── nginx.conf            (SPA fallback for client-side routing)
│       └── src/
├── db/
│   └── init/                 → SQL scripts run on first Postgres boot
├── docs/
│   ├── CONFIGURATION.md          → detailed setup guide (French)
│   └── novel-realm-plan.excalidraw → architecture / feature plan diagram
├── docker-compose.yml        → base (production) stack definition
├── docker-compose.dev.yml    → development overrides (hot-reload, volumes)
└── Makefile                  → shortcuts around docker-compose
```

**Key decisions**
- **Schema is owned by SQL, not the ORM.** `spring.jpa.hibernate.ddl-auto` is set to
  `none`: Hibernate never creates or alters tables. The schema is defined in
  [db/init/](db/init/) and executed by Postgres via the `/docker-entrypoint-initdb.d`
  mount. Every change is a reviewable file in Git. (Later, once entities exist, this
  can switch to `validate` so Hibernate *checks* the schema without modifying it.)
- **Two-mode Docker.** Production images are multi-stage and minimal (API: JDK+Gradle
  build → JRE-only runtime; web: Node build → nginx serving static files). Development
  mounts the source as a volume for hot-reload.
- **Layered backend.** Code is organized by feature, with visible layers:
  `*Repository` (data) → `*Service` (logic, transactions, entity→DTO) → `*Controller`
  (HTTP). DTOs decouple the transport shape from entities.
- **Stable frontend origin.** The web app is always on `localhost:5173` (dev and prod)
  so CORS configuration stays consistent.

---

## Getting started

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) (with
`docker-compose`) and **make**. You do **not** need Java or Node installed locally —
everything runs in containers.

```bash
git clone <repo-url> && cd novel-realm

make dev      # build & start db + api + web in hot-reload mode (background)
              # → App: http://localhost:5173   API: http://localhost:8080

make logs     # follow logs (Ctrl+C stops following, not the app)
make down     # stop and remove the containers
```

Verify it's up:

```bash
curl http://localhost:8080/api/ping     # → {"message":"pong"}
```

---

## Development workflow

All day-to-day commands go through the [Makefile](Makefile). Running `make` with no
target prints this list:

| Command | What it does |
|---------|--------------|
| `make` / `make help` | List all commands with descriptions (the default target). |
| `make dev` | Start the full stack in **dev** mode (hot-reload, code mounted as volumes), detached. |
| `make prod` | Start the full stack in **production** mode (frozen, multi-stage images). |
| `make logs` | Follow logs from all services. |
| `make ps` | Show container status. |
| `make db` | Start **only** PostgreSQL (useful when running the API yourself). |
| `make restart-api` | Restart the API to apply a backend change in dev. |
| `make rebuild` | Rebuild the dev images from scratch (no cache). |
| `make down` | Stop and remove the containers (keeps the database volume). |
| `make clean` | Stop everything **and delete the volumes** — ⚠️ the database is erased. |

In dev mode the frontend hot-reloads automatically and the backend reloads via Spring
DevTools (`make restart-api` forces it if needed). **Production mode** (`make prod`)
serves the same URLs (web on `5173`, API on `8080`) but from frozen multi-stage
images — the web app is built and served by nginx, with no hot-reload.

> **Heads up (docker-compose v1):** if `make dev` ever fails with
> `KeyError: 'ContainerConfig'`, run `make down` first, then `make dev`. It's a known
> legacy-builder bug that triggers when recreating an existing container after a rebuild.

---

## Configuration

| Service | Host port | In-container port |
|---------|-----------|-------------------|
| Web (Vite / nginx) | `5173` | `5173` (dev) / `80` (prod) |
| API (Spring Boot) | `8080` | `8080` |
| PostgreSQL | `5433` | `5432` |

> Postgres is exposed on **5433** (not the usual 5432) to avoid clashing with another
> local Postgres instance.

The API reads its datasource from environment variables, with local defaults baked in
([application.yml](apps/api/src/main/resources/application.yml)):

```yaml
url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5433}/novelrealm
username: ${DB_USER:novelrealm}
password: ${DB_PASSWORD:novelrealm}
```

Running locally → defaults to `localhost:5433`. Inside Docker → Compose injects
`DB_HOST=postgres` / `DB_PORT=5432` so the API reaches the database container directly.
No secret is hard-coded; production values can override the defaults.

The frontend reads its API base URL from `VITE_API_URL`, set in
[apps/web/.env.development](apps/web/.env.development) and
[apps/web/.env.production](apps/web/.env.production). Only variables prefixed with
`VITE_` are exposed to the browser.

---

## Database & schema

There is **no migration tool** (no Flyway/Liquibase). The schema is plain SQL:

- Every `.sql` file in [db/init/](db/init/) is executed by the Postgres container
  **once**, on the first creation of the database (empty volume), via
  `/docker-entrypoint-initdb.d`. Files run in alphabetical order — prefix them
  (`01_`, `02_`, …) to control ordering.
- To re-run the init scripts from a clean database: `make clean` (drops the volume),
  then `make dev`. They do **not** re-run on an existing database.

---

## Roadmap

Each milestone is meant to be independently demoable.

- ~~**M0 — Tooling & skeleton.**~~ ✅ Postgres via Docker, Spring Boot (Gradle) project, Vite app, `.gitignore`.
- ~~**M1 — Full-stack hello world.**~~ ✅ `GET /api/ping` rendered by React (CORS).
- ~~**Infra — Dockerized two-mode setup.**~~ ✅ `make dev` / `make prod` run the whole stack (db + api + web) in containers.
- **M2 — First entities + SQL schema.** `users` and `novels` tables, first persistence layers, `GET /api/novels`. *(in progress)*
- **M3 — Library page.** React grid consuming the API.
- **M4 — Relations & detail.** `Chapter`, `Genre`, novel detail page.
- **M5 — Reader.** Read a chapter, navigate prev/next.
- **M6 — Reading progress.** Save and resume.
- **M7 — Sources & aggregation.** Source adapters that fetch novels/chapters from configured third-party sites.
- **M8 — Local mode.** Import your own files and read offline.
- **M9 — Polish.** Global error handling, validation, search, tests.

---

## Documentation

- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — a thorough, beginner-friendly guide
  (in French) explaining **every piece** of the setup and the *why* behind it: Docker
  concepts, the Gradle wrapper, Compose orchestration, volumes, networking, SPA
  routing, and a journal of resolved pitfalls.
- [docs/novel-realm-plan.excalidraw](docs/novel-realm-plan.excalidraw) — the
  architecture & feature plan diagram (open with [Excalidraw](https://excalidraw.com)).

---

## Status

Active, early-stage, and built for learning. Expect the architecture to grow one
deliberate step at a time. This is a **solo learning project** — issues and
suggestions are welcome, but it isn't accepting pull requests right now.

> **Naming:** this repository was previously called "Anama". It is standardizing on
> **Novel Realm** (machine identifier `novelrealm` for the Java package, database, and
> containers); some paths may still reference the old name during the transition.

---

## License

No open-source license has been chosen yet, so the default applies: **all rights
reserved**. This is a personal project; if that changes, a `LICENSE` file will be
added here.
