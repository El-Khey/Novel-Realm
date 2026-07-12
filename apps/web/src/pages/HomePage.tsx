import { useState } from "react";
import { useNovels } from "@/features/novels/hooks/useNovels";
import { useGenres } from "@/features/genres/hooks/useGenres";
import { GenreBar } from "@/features/genres/components/GenreBar";
import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { useProgressSummary } from "@/features/progress/hooks/useProgressSummary";
import { NovelWithMenu } from "@/features/library/components/NovelWithMenu";
import AppLayout from "@/components/ui/AppLayout";

// Page d'accueil : le catalogue de romans. Barre de genres pour filtrer, et
// chaque carte porte un menu « Ajouter » (bibliothèque + étagères).
export default function HomePage() {
    const [genreId, setGenreId] = useState<number | null>(null);
    const { genres } = useGenres();
    const { novels, error } = useNovels(genreId ?? undefined);
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

                {genres && genres.length > 0 && (
                    <div className="mb-8">
                        <GenreBar genres={genres} activeId={genreId} onSelect={setGenreId} />
                    </div>
                )}

                {error ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Impossible de charger les romans : {error}
                    </p>
                ) : novels === null ? (
                    <p className="text-sm text-muted-foreground">Chargement…</p>
                ) : novels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun roman pour le moment.</p>
                ) : (
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
                )}
            </div>
        </AppLayout>
    );
}
