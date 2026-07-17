import { PosterCard } from "@/components/content/PosterCard";
import { AddToLibraryMenu } from "@/features/library/components/AddToLibraryMenu";
import type { Novel } from "@/features/novels/types";
import type { ReadingStatus } from "@/features/library/types";
import type { Category } from "@/features/categories/types";

interface Props {
    novel: Novel;
    libraryIds: Set<number>;
    categories: Category[];
    /** Chapitres non lus (badge), optionnel. */
    remaining?: number;
    /** Statut de lecture (si en bibliothèque), pour le menu. */
    status?: ReadingStatus;
    onToggleLibrary: (novelId: number, next: boolean) => Promise<void>;
    onToggleCategory: (novelId: number, categoryId: number, next: boolean) => Promise<void>;
    onCreateCategory: (novelId: number, name: string) => Promise<void>;
    onChangeStatus?: (novelId: number, status: ReadingStatus) => Promise<void>;
}

/**
 * Carte « poster » + menu d'ajout à la bibliothèque / aux étagères posé en coin.
 * Réutilisé par l'Accueil et la Bibliothèque pour un rendu et une gestion des
 * étagères identiques partout (équivalent poster de {@code NovelWithMenu}).
 */
export function NovelPosterMenu({
    novel,
    libraryIds,
    categories,
    remaining,
    status,
    onToggleLibrary,
    onToggleCategory,
    onCreateCategory,
    onChangeStatus,
}: Props) {
    const novelCategoryIds = new Set(
        categories.filter((c) => c.novels.some((n) => n.id === novel.id)).map((c) => c.id),
    );

    return (
        <div className="relative">
            <PosterCard novel={novel} remaining={remaining} />
            <div className="absolute right-3 top-3 z-20">
                <AddToLibraryMenu
                    inLibrary={libraryIds.has(novel.id)}
                    categories={categories}
                    novelCategoryIds={novelCategoryIds}
                    status={status}
                    onToggleLibrary={(next) => onToggleLibrary(novel.id, next)}
                    onToggleCategory={(catId, next) => onToggleCategory(novel.id, catId, next)}
                    onCreateCategory={(name) => onCreateCategory(novel.id, name)}
                    onChangeStatus={
                        onChangeStatus && ((s) => onChangeStatus(novel.id, s))
                    }
                />
            </div>
        </div>
    );
}
