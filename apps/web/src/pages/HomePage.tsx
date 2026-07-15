import { useEffect, useState } from "react";
import { useNovels } from "@/features/novels/hooks/useNovels";
import { useGenres } from "@/features/genres/hooks/useGenres";
import { GenreBar } from "@/features/genres/components/GenreBar";
import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { useProgressSummary } from "@/features/progress/hooks/useProgressSummary";
import { NovelWithMenu } from "@/features/library/components/NovelWithMenu";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/ui/AppLayout";
import type { Novel } from "@/features/novels/types";

const SELECT_CLASS =
    "h-9 rounded-md border border-border bg-input/30 px-2 text-sm text-foreground transition-colors hover:bg-input/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

type StatusFilter = "" | Novel["status"];
type SortOption = "recent" | "title" | "popularity";

// Page d'accueil : le catalogue de romans, avec recherche / filtres / tri
// (exerce l'endpoint GET /api/novels?q=&genreId=&status=&sort=).
export default function HomePage() {
    const [qInput, setQInput] = useState("");
    const [q, setQ] = useState("");
    const [genreId, setGenreId] = useState<number | null>(null);
    const [status, setStatus] = useState<StatusFilter>("");
    const [sort, setSort] = useState<SortOption>("recent");

    // Petit debounce sur la recherche : on ne requête pas à chaque frappe.
    useEffect(() => {
        const t = setTimeout(() => setQ(qInput.trim()), 300);
        return () => clearTimeout(t);
    }, [qInput]);

    const { genres } = useGenres();
    const { novels, error } = useNovels({
        q: q || undefined,
        genreId: genreId ?? undefined,
        status: status || undefined,
        sort,
    });
    const { categories, libraryIds, toggleLibrary, toggleCategory, createCategoryWithNovel } =
        useLibraryManager();
    const { remainingByNovel } = useProgressSummary();

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Accueil</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Explorez le catalogue de romans.
                    </p>
                </header>

                {/* Recherche + filtres + tri */}
                <div className="mb-6 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            placeholder="Rechercher un titre ou un auteur…"
                            aria-label="Rechercher"
                            className="sm:max-w-xs"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as StatusFilter)}
                            aria-label="Filtrer par statut"
                            className={SELECT_CLASS}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="ONGOING">En cours</option>
                            <option value="COMPLETED">Terminé</option>
                        </select>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            aria-label="Trier"
                            className={SELECT_CLASS}
                        >
                            <option value="recent">Plus récents</option>
                            <option value="title">Titre (A→Z)</option>
                            <option value="popularity">Populaires</option>
                        </select>
                    </div>

                    {genres && genres.length > 0 && (
                        <GenreBar genres={genres} activeId={genreId} onSelect={setGenreId} />
                    )}
                </div>

                {error ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Impossible de charger les romans : {error}
                    </p>
                ) : novels === null ? (
                    <p className="text-sm text-muted-foreground">Chargement…</p>
                ) : novels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aucun roman ne correspond à votre recherche.
                    </p>
                ) : (
                    <>
                        <p className="mb-4 text-xs text-muted-foreground">
                            {novels.length} roman{novels.length > 1 ? "s" : ""}
                        </p>
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                            {novels.map((novel) => (
                                <NovelWithMenu
                                    key={novel.id}
                                    novel={novel}
                                    libraryIds={libraryIds}
                                    categories={categories}
                                    unreadCount={remainingByNovel.get(novel.id)}
                                    onToggleLibrary={toggleLibrary}
                                    onToggleCategory={toggleCategory}
                                    onCreateCategory={createCategoryWithNovel}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
