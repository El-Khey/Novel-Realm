import { useNovels } from "@/features/novels/hooks/useNovels";
import { NovelCard } from "@/features/novels/components/NovelCard";
import AppLayout from "@/components/ui/AppLayout";

const GRID = "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4";

export default function LibraryPage() {
    const { novels, error } = useNovels();

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Bibliothèque</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Découvrez des centaines de nouvelles histoires.
                    </p>
                </header>

                {error ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Impossible de charger les romans : {error}
                    </p>
                ) : novels === null ? (
                    <LibrarySkeleton />
                ) : novels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun roman pour le moment.</p>
                ) : (
                    <div className={GRID}>
                        {novels.map((novel) => (
                            <NovelCard key={novel.id} novel={novel} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function LibrarySkeleton() {
    return (
        <div className={GRID}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="aspect-3/4 w-full animate-pulse rounded-xl bg-secondary" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                </div>
            ))}
        </div>
    );
}