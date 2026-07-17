import { NovelCard } from "@/features/novels/components/NovelCard";
import { AddToLibraryMenu } from "@/features/library/components/AddToLibraryMenu";
import type { Novel } from "@/features/novels/types";
import type { ReadingStatus } from "@/features/library/types";
import type { Category } from "@/features/categories/types";

interface Props {
    novel: Novel;
    libraryIds: Set<number>;
    categories: Category[];
    /** Chapitres non lus à afficher en badge (optionnel). */
    unreadCount?: number;
    /** Statut de lecture (si en bibliothèque), pour le menu. */
    status?: ReadingStatus;
    onToggleLibrary: (novelId: number, next: boolean) => Promise<void>;
    onToggleCategory: (novelId: number, categoryId: number, next: boolean) => Promise<void>;
    onCreateCategory: (novelId: number, name: string) => Promise<void>;
    onChangeStatus?: (novelId: number, status: ReadingStatus) => Promise<void>;
}

/**
 * Carte de roman avec, en coin, le menu d'ajout à la bibliothèque / aux
 * étagères. Composant unique réutilisé par l'Accueil et la Bibliothèque, pour
 * une gestion des catégories identique partout.
 */
export function NovelWithMenu({
    novel,
    libraryIds,
    categories,
    unreadCount,
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
            <NovelCard novel={novel} unreadCount={unreadCount} />
            <div className="absolute right-2 top-2 z-10">
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
