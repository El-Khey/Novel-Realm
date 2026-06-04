# Anama

> A local-first reader for Light Novels — built as a learning project.

## What is this?

Anama is a personal project to build a clean, modern application for reading
Light Novels. It is **not** a race to ship features: the real goal is to
**become a better developer** — to understand *why* each decision is made, learn
solid engineering practices, and make real architecture choices.

The first version focuses on doing **one thing well**: browse a library of
novels, open one, read its chapters, and resume where you left off.

> Internal note: this repository was bootstrapped under the name "Codex". We are
> standardizing on **Anama** going forward (database, packages, config).

---

## Project goals

- **Quality over speed.** We move deliberately and understand every line.
- **Understand the "why".** No technology is added before we know what problem
  it solves.
- **Learn real practices.** Layered architecture, database migrations, clean
  API design, separation of concerns, typed front-end.

---

## Tech stack (and why)

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | **Java 21 + Spring Boot + Spring Data JPA** | The industry-standard backend stack. Teaches dependency injection, layered architecture, and ORM. |
| Build tool | **Gradle** (with wrapper) | The wrapper (`./gradlew`) runs the right Gradle version with no manual install. |
| Frontend | **React + TypeScript + Tailwind CSS** | React is the dominant UI library; TypeScript gives type safety; Tailwind keeps styling fast and consistent. |
| Build/dev tool (front) | **Vite** | Fast, modern dev server and bundler. |
| Database | **PostgreSQL** | A robust relational database — our data (novels, chapters, genres) is highly relational. |
| Schema | **Plain SQL init scripts** (`db/init/`) | Simple, explicit schema managed by hand, run automatically by Postgres on first boot. No migration tool until we actually need one. |
| Infrastructure | **Docker Compose** | Reproducible environment — `docker-compose up` gives anyone the same database. |

We deliberately keep the toolbox small and add things only when a real need
appears.

---

## V1 scope

**In scope (what we are building):**

- A **library** view: a grid of novels with cover, title, author, status.
- A **novel detail** view: description, genres, and the list of chapters.
- A **reader**: read a chapter's text, navigate previous/next.
- **Reading progress**: save and resume where you stopped.
- **Search & genre filter** on the library.

**Explicitly out of scope for V1** (planned for later — see Roadmap):

- EPUB / PDF import and local folder scanning.
- Auto-update from an online source.
- User accounts / multi-user (V1 is single-user).
- Recommendations.

> **Why store text in the database instead of parsing EPUB first?** Parsing EPUB
> (ZIP + XHTML + embedded assets) is a project of its own and teaches us nothing
> about Spring or React. By storing chapter text directly in the database, we
> focus on the real full-stack loop. A future EPUB importer will produce the
> exact same `Novel` + `Chapter` rows — so there is **no technical debt** in
> postponing it.

---

## Architecture

This is a **monorepo**: backend and frontend live side by side.

```
Anama/
├── apps/
│   ├── api/    → Spring Boot backend (REST API)
│   └── web/    → React + TypeScript frontend
├── docker-compose.yml   → PostgreSQL for local dev
└── README.md
```

### Data model (V1)

```
novel ──< chapter            (a novel has many chapters)
novel ──< reading_progress   (one progress row per novel — single user)
novel >──< genre             (many-to-many via novel_genre)
```

- **novel**: `title`, `author`, `description`, `cover_url`, `status`
  (`ONGOING` / `COMPLETED` / `HIATUS`).
- **chapter**: belongs to a novel, has `chapter_number`, `title`, `content`
  (text), and `content_format` (`PLAIN` / `HTML` / `MARKDOWN`, default `PLAIN`).
- **reading_progress**: tracks the last chapter and scroll position per novel.
- **genre** + **novel_genre**: genres as a reusable, normalized table.

### Backend structure (package-by-feature)

Code is grouped by domain (`novel/`, `chapter/`, `progress/`, `genre/`) rather
than by technical layer. Within each feature the layers are visible by suffix:

- `*Repository` — data access (Spring Data, no SQL).
- `*Service` — business logic, `@Transactional`, entity→DTO mapping.
- `*Controller` — HTTP layer (URLs, validation, status codes, DTOs).
- `dto/` — transport objects, **decoupled from entities** (entities never leave
  the backend directly).

---

## Roadmap

### V1 — milestones

Each milestone is independently demoable.

- ~~**M0 — Tooling & skeleton.**~~ ✅ Postgres via Docker, Spring Boot (Gradle)
  project, Vite app, `.gitignore`.
- ~~**M1 — Full-stack hello world.**~~ ✅ `GET /api/ping` rendered by React (CORS).
- ~~**Infra — Dockerized two-mode setup.**~~ ✅ `make dev` / `make prod` run the
  whole stack (db + api + web) in containers; brought forward from M7.
- **M2 — First entity + SQL schema + seed.** `Novel`, `db/init/` SQL script, `GET /api/novels`.
- **M3 — Library page.** React grid consuming the API.
- **M4 — Relations & detail.** `Chapter`, `Genre`, novel detail page.
- **M5 — Reader.** Read a chapter, navigate prev/next.
- **M6 — Reading progress.** Save and resume.
- **M7 — Polish.** Global error handling, validation, search, tests, Dockerfiles.

### Long-term vision

EPUB/PDF import · local folder scanning · auto-update from online sources ·
user accounts · advanced search · recommendations.

---

## Getting started (with Docker)

Everything runs in Docker, so the only prerequisites are **Docker** (with
`docker-compose`) and **make** — no need to install Java or Node locally.

```bash
git clone <repo> && cd Anama

make dev      # start db + api + web in hot-reload mode (background)
              # → App: http://localhost:5173   API: http://localhost:8080

make logs     # follow logs (Ctrl+C stops following, not the app)
make down     # stop everything
```

Open http://localhost:5173 — you should see the app connect to the API.

There are **two modes**, both driven by the `Makefile`:

| Command | Mode | What it does |
|---------|------|--------------|
| `make dev` | development | Source mounted in containers, **hot-reload** (Vite HMR; `make restart-api` to apply backend changes). |
| `make prod` | production | Frozen images: a Spring `.jar` + the front bundle served by nginx. |

Run `make help` for the full list of commands.

> **Two notes:** (1) Postgres is exposed on host port **5433** (not 5432) to
> avoid conflicts with other local Postgres instances. (2) Docker mode and
> hand-run local servers are mutually exclusive on ports 8080/5173 — pick one.

> 📖 **Want to understand *how* and *why* the whole setup works** (Docker,
> Gradle, compose, the Makefile)? See the detailed walkthrough (in French):
> [docs/CONFIGURATION.md](docs/CONFIGURATION.md).
