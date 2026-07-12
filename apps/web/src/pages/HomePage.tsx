import { useNovels } from "@/features/novels/hooks/useNovels";
import { useLibrary } from "@/features/library/hooks/useLibrary";
import { NovelCard } from "@/features/novels/components/NovelCard";
import { AddToLibraryButton } from "@/features/library/components/AddToLibraryButton";
import AppLayout from "@/components/ui/AppLayout";

// Page d'accueil : le catalogue de romans (tout ce que propose le site).
// Chaque carte a un bouton « Ajouter à ma bibliothèque » ; la Bibliothèque
// (page /novels) affiche ensuite ces romans suivis. Version simple/temporaire.
export default function HomePage() {
    const { novels, error } = useNovels();
    const { entries, add } = useLibrary();

    // Ids des romans déjà en bibliothèque → pour basculer le bouton sur « Ajouté ».
    const addedIds = new Set((entries ?? []).map((e) => e.novel.id));

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Accueil</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Explorez le catalogue de romans.
                    </p>
                </header>

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
                            <div key={novel.id} className="relative">
                                <NovelCard novel={novel} />
                                <div className="absolute right-2 top-2 z-10">
                                    <AddToLibraryButton
                                        inLibrary={addedIds.has(novel.id)}
                                        onAdd={() => add(novel.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
