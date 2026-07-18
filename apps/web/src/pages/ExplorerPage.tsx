import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ArrowDown01Icon,
    ArrowRight01Icon,
    ArrowUpDownIcon,
    BookOpen01Icon,
    Cancel01Icon,
    Compass01Icon,
    GridViewIcon,
    ListViewIcon,
    Loading03Icon,
    RefreshIcon,
    Search01Icon,
    SearchRemoveIcon,
    Tag01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { useCatalog } from "@/features/novels/hooks/useCatalog";
import { useGenres } from "@/features/genres/hooks/useGenres";
import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { useProgressSummary } from "@/features/progress/hooks/useProgressSummary";
import { NovelPosterMenu } from "@/components/content/NovelPosterMenu";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NOVEL_STATUS } from "@/features/novels/status";
import type { Novel } from "@/features/novels/types";
import { SelectMenu, type SelectOption } from "@/components/ui/SelectMenu";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/icon";
import AppLayout from "@/components/ui/AppLayout";
import { cn } from "@/lib/utils";

type StatusFilter = "" | Novel["status"];
type SortOption = "recent" | "title" | "popularity";
type ViewMode = "grid" | "list";

// Grille Explorer : posters plus grands (max 5 colonnes) et resserrés.
const GRID_CLASS = "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

const STATUS_OPTIONS: SelectOption<StatusFilter>[] = [
    { value: "", label: "Tous les statuts" },
    { value: "ONGOING", label: "En cours", dot: "bg-primary" },
    { value: "COMPLETED", label: "Terminé", dot: "bg-emerald-400" },
];

const SORT_OPTIONS: SelectOption<SortOption>[] = [
    { value: "recent", label: "Plus récents" },
    { value: "popularity", label: "Popularité" },
    { value: "title", label: "Alphabétique (A→Z)" },
];

/**
 * Explorer / Catalogue : navigation de tout le catalogue avec recherche,
 * filtres (genre, statut), tri et défilement infini. L'état complet vit dans
 * l'URL (`?q=&genreId=&status=&sort=`) → partageable, restaurable, « retour »
 * fonctionnel. Consomme le backend `/api/novels` (déjà en place, cf. #13).
 */
export default function ExplorerPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // L'URL est la source de vérité : on dérive les critères à chaque rendu.
    const q = searchParams.get("q")?.trim() ?? "";
    const genreRaw = searchParams.get("genreId");
    const genreNum = genreRaw ? Number(genreRaw) : NaN;
    const genreId = Number.isFinite(genreNum) ? genreNum : null;
    const statusRaw = searchParams.get("status");
    const status: StatusFilter =
        statusRaw === "ONGOING" || statusRaw === "COMPLETED" ? statusRaw : "";
    const sortRaw = searchParams.get("sort");
    const sort: SortOption = sortRaw === "title" || sortRaw === "popularity" ? sortRaw : "recent";

    const [view, setView] = useState<ViewMode>("grid");

    // Met à jour un paramètre d'URL (le supprime si vide). `replace` évite de
    // polluer l'historique (frappe au clavier) ; les filtres discrets poussent.
    const setParam = useCallback(
        (key: string, value: string | null, opts?: { replace?: boolean }) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (value == null || value === "") next.delete(key);
                    else next.set(key, value);
                    return next;
                },
                { replace: opts?.replace },
            );
        },
        [setSearchParams],
    );

    // Champ de recherche : miroir local + debounce vers l'URL.
    const [qInput, setQInput] = useState(q);
    useEffect(() => {
        const t = setTimeout(() => {
            const trimmed = qInput.trim();
            if (trimmed !== q) setParam("q", trimmed || null, { replace: true });
        }, 300);
        return () => clearTimeout(t);
    }, [qInput, q, setParam]);
    // Synchronise le champ si l'URL change de l'extérieur (recherche navbar…).
    useEffect(() => {
        setQInput((cur) => (cur.trim() === q ? cur : q));
    }, [q]);

    // Données
    const { genres } = useGenres();
    const { items, total, hasMore, loadingMore, error, loadMore, reload } = useCatalog({
        q: q || undefined,
        genreId: genreId ?? undefined,
        status: status || undefined,
        sort,
    });
    const {
        categories,
        libraryIds,
        statusByNovel,
        toggleLibrary,
        changeStatus,
        toggleCategory,
        createCategoryWithNovel,
    } = useLibraryManager();
    const { remainingByNovel } = useProgressSummary();

    const activeGenre = genreId != null ? genres?.find((g) => g.id === genreId) ?? null : null;
    const hasFilters = q !== "" || genreId != null || status !== "";

    // « Tous les genres » + un choix par genre, pour le menu de filtre.
    const genreOptions: SelectOption<string>[] = [
        { value: "", label: "Tous les genres" },
        ...(genres ?? []).map((g) => ({ value: String(g.id), label: g.name })),
    ];

    function clearFilters() {
        setQInput("");
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("q");
            next.delete("genreId");
            next.delete("status");
            return next; // on conserve le tri courant
        });
    }

    // Défilement infini : on charge la page suivante dès que la sentinelle
    // approche du viewport. Re-souscrit après chaque page pour enchaîner tant
    // que la sentinelle reste visible. Le bouton « Charger plus » reste le
    // filet de sécurité accessible.
    const sentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        // Pas d'auto-chargement tant qu'une erreur de pagination est en attente :
        // on laisse l'utilisateur cliquer « Réessayer » plutôt que boucler.
        if (!el || !hasMore || error) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "800px" },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasMore, loadingMore, loadMore, error]);

    return (
        <AppLayout>
            {/* ── HERO ─────────────────────────────────────────────────── */}
            <header className="relative overflow-hidden">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -right-24 -top-32 size-104 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute -left-24 top-4 size-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
                </div>

                <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16">
                    <Reveal>
                        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    <Icon icon={Compass01Icon} size={14} strokeWidth={2.5} />
                                    Catalogue
                                </span>
                                <h1 className="mt-4 font-heading text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                                    Parcourir
                                    <br />
                                    <span className="bg-linear-to-r from-primary to-primary-active bg-clip-text text-transparent">
                                        les novels
                                    </span>
                                </h1>
                                <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    Explorez toute la collection. Filtrez par genre, statut et tri
                                    pour dénicher votre prochaine lecture.
                                </p>
                            </div>

                            <dl className="flex divide-x divide-border/60">
                                <HeroStat
                                    value={items === null ? null : total}
                                    label="Novels"
                                    first
                                />
                                <HeroStat
                                    value={genres === null ? null : genres.length}
                                    label="Genres"
                                />
                            </dl>
                        </div>
                    </Reveal>
                </div>
            </header>

            {/* ── BARRE D'OUTILS (sticky) ──────────────────────────────── */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-2">
                        <div className="relative min-w-48 flex-1">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Icon icon={Search01Icon} size={17} />
                            </span>
                            <input
                                value={qInput}
                                onChange={(e) => setQInput(e.target.value)}
                                placeholder="Rechercher un titre, un auteur…"
                                aria-label="Rechercher un roman"
                                className="h-10 w-full rounded-xl border border-transparent bg-secondary pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                            />
                        </div>

                        <SelectMenu
                            value={genreId != null ? String(genreId) : ""}
                            options={genreOptions}
                            onChange={(v) => setParam("genreId", v || null)}
                            label="Filtrer par genre"
                            icon={Tag01Icon}
                            compactLabel
                        />
                        <SelectMenu
                            value={status}
                            options={STATUS_OPTIONS}
                            onChange={(v) => setParam("status", v || null)}
                            label="Filtrer par statut"
                            icon={BookOpen01Icon}
                            compactLabel
                        />
                        <SelectMenu
                            value={sort}
                            options={SORT_OPTIONS}
                            onChange={(v) => setParam("sort", v === "recent" ? null : v)}
                            label="Trier"
                            icon={ArrowUpDownIcon}
                            compactLabel
                        />

                        <ViewToggle view={view} onChange={setView} />
                    </div>

                    {/* Chips de filtres actifs */}
                    {hasFilters && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {q !== "" && (
                                <FilterChip
                                    label={`« ${q} »`}
                                    onRemove={() => {
                                        setQInput("");
                                        setParam("q", null, { replace: true });
                                    }}
                                />
                            )}
                            {activeGenre && (
                                <FilterChip
                                    label={activeGenre.name}
                                    onRemove={() => setParam("genreId", null)}
                                />
                            )}
                            {status !== "" && (
                                <FilterChip
                                    label={NOVEL_STATUS[status].label}
                                    onRemove={() => setParam("status", null)}
                                />
                            )}
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="ml-1 text-xs font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                            >
                                Tout effacer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── RÉSULTATS ────────────────────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {/* Région live : annonce chargement / nombre de résultats / vide
                    aux lecteurs d'écran (WCAG 4.1.3), et sert de compteur visible. */}
                <p
                    role="status"
                    aria-live="polite"
                    aria-busy={items === null && error === null}
                    className="mb-4 text-xs text-muted-foreground"
                >
                    {items === null
                        ? error
                            ? ""
                            : "Chargement du catalogue…"
                        : items.length === 0
                          ? "Aucun résultat"
                          : `${total.toLocaleString("fr-FR")} roman${total > 1 ? "s" : ""}`}
                </p>

                {items === null ? (
                    error ? (
                        <ErrorBox
                            message={`Impossible de charger le catalogue : ${error}`}
                            onRetry={reload}
                        />
                    ) : (
                        <div className={GRID_CLASS}>
                            {Array.from({ length: 18 }).map((_, i) => (
                                <PosterSkeleton key={i} />
                            ))}
                        </div>
                    )
                ) : items.length === 0 ? (
                    <EmptyState filtered={hasFilters} onReset={clearFilters} />
                ) : (
                    <>
                        {view === "grid" ? (
                            <div className={GRID_CLASS}>
                                {items.map((novel) => (
                                    <NovelPosterMenu
                                        key={novel.id}
                                        novel={novel}
                                        libraryIds={libraryIds}
                                        categories={categories}
                                        remaining={remainingByNovel.get(novel.id)}
                                        status={statusByNovel.get(novel.id)}
                                        onToggleLibrary={toggleLibrary}
                                        onToggleCategory={toggleCategory}
                                        onCreateCategory={createCategoryWithNovel}
                                        onChangeStatus={async (novelId, s) => {
                                            await changeStatus(novelId, s);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {items.map((novel) => (
                                    <CatalogRow key={novel.id} novel={novel} />
                                ))}
                            </div>
                        )}

                        {/* Sentinelle de défilement infini (désarmée si erreur). */}
                        <div ref={sentinelRef} aria-hidden className="h-px" />

                        {/* Erreur de pagination : on garde la liste, on propose de
                            réessayer. Sinon, filet de sécurité « Charger plus ». */}
                        {error ? (
                            <div className="mt-8">
                                <ErrorBox
                                    message={`Impossible de charger la suite : ${error}`}
                                    onRetry={loadMore}
                                />
                            </div>
                        ) : hasMore ? (
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                                >
                                    <Icon
                                        icon={loadingMore ? Loading03Icon : ArrowDown01Icon}
                                        size={17}
                                        strokeWidth={2.2}
                                        className={loadingMore ? "animate-spin" : undefined}
                                    />
                                    {loadingMore ? "Chargement…" : "Charger plus"}
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

/** Chiffre-clé du hero (aligné sur celui de la Bibliothèque). */
function HeroStat({ value, label, first }: { value: number | null; label: string; first?: boolean }) {
    return (
        <div className={cn("px-6", first && "pl-0")}>
            <dd className="font-heading text-4xl font-extrabold leading-none tabular-nums sm:text-5xl">
                {value === null ? (
                    <span className="text-muted-foreground/40">—</span>
                ) : (
                    value.toLocaleString("fr-FR")
                )}
            </dd>
            <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </dt>
        </div>
    );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
    const modes: { mode: ViewMode; icon: IconSvgElement; label: string }[] = [
        { mode: "grid", icon: GridViewIcon, label: "Vue grille" },
        { mode: "list", icon: ListViewIcon, label: "Vue liste" },
    ];
    return (
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-secondary p-1">
            {modes.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    type="button"
                    onClick={() => onChange(mode)}
                    aria-label={label}
                    aria-pressed={view === mode}
                    className={cn(
                        "grid size-8 place-items-center rounded-lg transition-colors",
                        view === mode
                            ? "bg-background text-foreground shadow"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <Icon icon={icon} size={17} />
                </button>
            ))}
        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-foreground">
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Retirer le filtre ${label}`}
                className="grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/20 hover:text-foreground"
            >
                <Icon icon={Cancel01Icon} size={12} strokeWidth={2.5} />
            </button>
        </span>
    );
}

function CatalogRow({ novel }: { novel: Novel }) {
    const status = NOVEL_STATUS[novel.status];
    return (
        <Link
            to={`/novels/${novel.id}`}
            aria-label={`${novel.title}, par ${novel.author} · ${status.label}`}
            className="group flex items-center gap-4 rounded-xl bg-card p-3 ring-1 ring-white/5 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            <div className="w-11 shrink-0 overflow-hidden rounded-md shadow-md shadow-black/40">
                <NovelCover
                    title={novel.title}
                    coverImageUrl={novel.coverImageUrl}
                    className="aspect-3/4"
                />
            </div>
            <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold text-foreground">{novel.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{novel.author}</p>
            </div>
            <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
                {status.label}
            </span>
            <Icon
                icon={ArrowRight01Icon}
                size={18}
                className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
        </Link>
    );
}

function EmptyState({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-card/50 px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
                <Icon icon={SearchRemoveIcon} size={24} />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
                Aucun roman ne correspond à votre recherche.
            </p>
            {filtered && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                    Réinitialiser les filtres
                </button>
            )}
        </div>
    );
}

function PosterSkeleton() {
    return (
        <div className="p-2">
            <div className="mb-3 aspect-2/3 w-full animate-pulse rounded-lg bg-secondary" />
            <div className="mb-1.5 h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
    );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
            <span>{message}</span>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15"
                >
                    <Icon icon={RefreshIcon} size={14} strokeWidth={2.4} />
                    Réessayer
                </button>
            )}
        </div>
    );
}
