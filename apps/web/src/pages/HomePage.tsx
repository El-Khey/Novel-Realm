import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight01Icon,
    ArrowUpDownIcon,
    BookOpen01Icon,
    Clock01Icon,
    Compass01Icon,
    FireIcon,
    SparklesIcon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { SelectMenu, type SelectOption } from "@/components/ui/SelectMenu";

import { useNovels } from "@/features/novels/hooks/useNovels";
import { useGenres } from "@/features/genres/hooks/useGenres";
import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { useProgressSummary } from "@/features/progress/hooks/useProgressSummary";
import { useHistory } from "@/features/history/hooks/useHistory";
import { GenreBar } from "@/features/genres/components/GenreBar";
import type { Genre } from "@/features/genres/types";
import type { Novel } from "@/features/novels/types";
import type { HistoryEntry } from "@/features/history/types";

import { HeroCarousel } from "@/components/content/HeroCarousel";
import { Shelf } from "@/components/content/Shelf";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PosterCard } from "@/components/content/PosterCard";
import { ContinueCard } from "@/components/content/ContinueCard";
import { NovelPosterMenu } from "@/components/content/NovelPosterMenu";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/icon";
import AppLayout from "@/components/ui/AppLayout";

type StatusFilter = "" | Novel["status"];
type SortOption = "recent" | "title" | "popularity";

const HOME_STATUS_OPTIONS: SelectOption<StatusFilter>[] = [
    { value: "", label: "Tous les statuts" },
    { value: "ONGOING", label: "En cours", dot: "bg-primary" },
    { value: "COMPLETED", label: "Terminé", dot: "bg-emerald-400" },
];

const HOME_SORT_OPTIONS: SelectOption<SortOption>[] = [
    { value: "recent", label: "Plus récents" },
    { value: "title", label: "Titre (A→Z)" },
    { value: "popularity", label: "Populaires" },
];

const GRID_CLASS =
    "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

const CONTINUE_ITEM = "flex-[0_0_86%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] xl:flex-[0_0_25%]";

// Tuiles de genre : ~1,6 visibles en mobile → ~5,5 en très large (une seule ligne).
const GENRE_ITEM =
    "flex-[0_0_60%] sm:flex-[0_0_38%] md:flex-[0_0_30%] lg:flex-[0_0_23%] xl:flex-[0_0_18%]";

/**
 * Accueil : vitrine du catalogue. Bandeau à la une, étagères façon Spotify
 * (reprise, populaires, nouveautés), une ligne de genres, et une section
 * « Explorer » qui expose recherche + filtres + tri sur le catalogue complet.
 * (La page /explorer dédiée offre la même chose en plus riche.)
 */
export default function HomePage() {
    const exploreRef = useRef<HTMLElement>(null);

    // État de la recherche « Explorer »
    const [qInput, setQInput] = useState("");
    const [q, setQ] = useState("");
    const [genreId, setGenreId] = useState<number | null>(null);
    const [status, setStatus] = useState<StatusFilter>("");
    const [sort, setSort] = useState<SortOption>("recent");

    // Debounce de la saisie de recherche.
    useEffect(() => {
        const t = setTimeout(() => setQ(qInput.trim()), 300);
        return () => clearTimeout(t);
    }, [qInput]);

    // Données
    const { genres } = useGenres();
    const { novels: recent, error: recentError } = useNovels({ sort: "recent" });
    const { novels: popular, error: popularError } = useNovels({ sort: "popularity" });
    const explore = useNovels({
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
    const { data: history } = useHistory();

    // « Reprendre » : dernier chapitre ouvert par roman (dédupliqué).
    const continueItems = useMemo(() => {
        const seen = new Set<number>();
        const out: HistoryEntry[] = [];
        for (const e of history?.content ?? []) {
            if (seen.has(e.novelId)) continue;
            seen.add(e.novelId);
            out.push(e);
            if (out.length >= 12) break;
        }
        return out;
    }, [history]);

    const heroNovels = recent?.slice(0, 5) ?? [];

    // Sélectionne un genre puis défile jusqu'à la section Explorer.
    function pickGenre(id: number | null) {
        setGenreId(id);
        exploreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
                {/* À LA UNE */}
                {recentError ? null : recent === null ? (
                    <HeroSkeleton />
                ) : (
                    <HeroCarousel novels={heroNovels} />
                )}

                {/* REPRENDRE LA LECTURE */}
                {continueItems.length > 0 && (
                    <Reveal>
                        <section>
                            <SectionHeader
                                title="Reprendre la lecture"
                                icon={Clock01Icon}
                                action={{ label: "Historique", to: "/historique" }}
                            />
                            <Shelf
                                itemClassName={CONTINUE_ITEM}
                                items={continueItems.map((e) => (
                                    <ContinueCard key={e.chapterId} entry={e} />
                                ))}
                            />
                        </section>
                    </Reveal>
                )}

                {/* POPULAIRES */}
                <ShelfSection
                    title="Populaires"
                    icon={FireIcon}
                    novels={popular}
                    error={popularError}
                    remainingByNovel={remainingByNovel}
                    onSeeAll={() => {
                        setSort("popularity");
                        pickGenre(genreId);
                    }}
                />

                {/* NOUVEAUTÉS */}
                <ShelfSection
                    title="Nouveautés"
                    icon={SparklesIcon}
                    novels={recent}
                    error={recentError}
                    remainingByNovel={remainingByNovel}
                    onSeeAll={() => {
                        setSort("recent");
                        pickGenre(genreId);
                    }}
                />

                {/* PARCOURIR PAR GENRE — une seule ligne + « Voir plus » au bout */}
                {genres && genres.length > 0 && (
                    <Reveal>
                        <section>
                            <SectionHeader title="Parcourir par genre" icon={Compass01Icon} />
                            <Shelf
                                itemClassName={GENRE_ITEM}
                                items={[
                                    ...genres.map((genre) => (
                                        <GenreTile key={genre.id} genre={genre} onPick={pickGenre} />
                                    )),
                                    <GenreSeeMore key="__see_more__" />,
                                ]}
                            />
                        </section>
                    </Reveal>
                )}

                {/* EXPLORER LE CATALOGUE */}
                <section ref={exploreRef} id="explorer" className="scroll-mt-20">
                    <SectionHeader
                        title="Explorer le catalogue"
                        icon={Search01Icon}
                        action={{ label: "Vue complète", to: "/explorer" }}
                    />

                    {/* Barre de recherche + filtres + tri */}
                    <div className="mb-5 rounded-2xl border border-border/70 bg-card/50 p-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="relative flex-1">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Icon icon={Search01Icon} size={18} />
                                </span>
                                <input
                                    value={qInput}
                                    onChange={(e) => setQInput(e.target.value)}
                                    placeholder="Rechercher un titre ou un auteur…"
                                    aria-label="Rechercher"
                                    className="h-10 w-full rounded-full border border-transparent bg-secondary pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                                />
                            </div>
                            <div className="flex gap-2">
                                <SelectMenu
                                    value={status}
                                    options={HOME_STATUS_OPTIONS}
                                    onChange={setStatus}
                                    label="Filtrer par statut"
                                    icon={BookOpen01Icon}
                                    compactLabel
                                />
                                <SelectMenu
                                    value={sort}
                                    options={HOME_SORT_OPTIONS}
                                    onChange={setSort}
                                    label="Trier"
                                    icon={ArrowUpDownIcon}
                                    compactLabel
                                />
                            </div>
                        </div>

                        {genres && genres.length > 0 && (
                            <div className="mt-3 border-t border-border/70 pt-3">
                                <GenreBar genres={genres} activeId={genreId} onSelect={setGenreId} />
                            </div>
                        )}
                    </div>

                    {/* Résultats */}
                    {explore.error ? (
                        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            Impossible de charger les romans : {explore.error}
                        </p>
                    ) : explore.novels === null ? (
                        <div className={GRID_CLASS}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <PosterSkeleton key={i} />
                            ))}
                        </div>
                    ) : explore.novels.length === 0 ? (
                        <p className="rounded-xl border border-border/70 bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
                            Aucun roman ne correspond à votre recherche.
                        </p>
                    ) : (
                        <>
                            <p className="mb-3 text-xs text-muted-foreground">
                                {explore.novels.length} roman{explore.novels.length > 1 ? "s" : ""}
                            </p>
                            <div className={GRID_CLASS}>
                                {explore.novels.map((novel) => (
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
                        </>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

/** Une section « étagère » : en-tête + carrousel de posters (ou squelette). */
function ShelfSection({
    title,
    icon,
    novels,
    error,
    remainingByNovel,
    onSeeAll,
}: {
    title: string;
    icon: IconSvgElement;
    novels: Novel[] | null;
    error?: string | null;
    remainingByNovel: Map<number, number>;
    onSeeAll: () => void;
}) {
    // En cas d'erreur, on masque l'étagère (l'Explorer ci-dessous relaie l'erreur).
    if (error) return null;
    if (novels !== null && novels.length === 0) return null;

    return (
        <Reveal>
            <section>
                <SectionHeader
                    title={title}
                    icon={icon}
                    action={{ label: "Voir tout", onClick: onSeeAll }}
                />
                {novels === null ? (
                    <div className="flex gap-0.5 overflow-hidden sm:gap-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-[0_0_44%] sm:flex-[0_0_30%] md:flex-[0_0_23%] lg:flex-[0_0_18.5%] xl:flex-[0_0_15.5%]"
                            >
                                <PosterSkeleton />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Shelf
                        items={novels.slice(0, 18).map((novel) => (
                            <PosterCard
                                key={novel.id}
                                novel={novel}
                                remaining={remainingByNovel.get(novel.id)}
                            />
                        ))}
                    />
                )}
            </section>
        </Reveal>
    );
}

/** Tuile de genre (dans la ligne) : filtre l'Explorer de l'accueil sur ce genre. */
function GenreTile({ genre, onPick }: { genre: Genre; onPick: (id: number) => void }) {
    return (
        <button
            type="button"
            onClick={() => onPick(genre.id)}
            className="group relative flex aspect-16/10 w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            {/* Lueur cramoisie au survol (accent unique, palette sobre) */}
            <span className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative font-heading text-sm font-bold leading-tight text-foreground sm:text-base">
                {genre.name}
            </span>
            <span className="absolute -bottom-3 -right-2 text-primary/20 transition-colors group-hover:text-primary/40">
                <Icon icon={Compass01Icon} size={64} strokeWidth={1.5} />
            </span>
        </button>
    );
}

/** Dernière tuile de la ligne de genres : mène à la page Explorer complète. */
function GenreSeeMore() {
    return (
        <Link
            to="/explorer"
            aria-label="Voir tous les genres sur la page Explorer"
            className="group relative flex aspect-16/10 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border bg-card/40 text-center transition-colors hover:border-primary/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            <span className="grid size-9 place-items-center rounded-full bg-primary/12 text-primary transition-transform group-hover:scale-110">
                <Icon icon={ArrowRight01Icon} size={18} strokeWidth={2.4} />
            </span>
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                Voir plus
            </span>
        </Link>
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

function HeroSkeleton() {
    return <div className="h-90 w-full animate-pulse rounded-2xl bg-card sm:h-105" />;
}
