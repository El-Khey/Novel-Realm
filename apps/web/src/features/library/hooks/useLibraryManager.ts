import { useLibrary } from "@/features/library/hooks/useLibrary";
import { useCategories } from "@/features/categories/hooks/useCategories";

/**
 * Combine la bibliothèque (romans suivis) et les étagères, et centralise la
 * logique de rangement d'un roman — partagée par l'Accueil et la Bibliothèque.
 *
 * <p>Règle du modèle : ranger un roman dans une étagère l'ajoute aussi à la
 * bibliothèque (pour qu'il apparaisse dans « Tous »).
 */
export function useLibraryManager() {
    const { entries, error: libError, add, changeStatus, remove } = useLibrary();
    const {
        categories,
        error: catError,
        create,
        rename,
        remove: removeCategory,
        addNovel,
        removeNovel,
    } = useCategories();

    const cats = categories ?? [];
    const libraryIds = new Set((entries ?? []).map((e) => e.novel.id));
    /** novelId → statut de lecture (uniquement les romans en bibliothèque). */
    const statusByNovel = new Map((entries ?? []).map((e) => [e.novel.id, e.status]));

    async function toggleLibrary(novelId: number, next: boolean) {
        if (next) await add(novelId);
        else await remove(novelId);
    }

    async function toggleCategory(novelId: number, categoryId: number, next: boolean) {
        if (next) {
            if (!libraryIds.has(novelId)) await add(novelId);
            await addNovel(categoryId, novelId);
        } else {
            await removeNovel(categoryId, novelId);
        }
    }

    async function createCategoryWithNovel(novelId: number, name: string) {
        const category = await create(name);
        if (!libraryIds.has(novelId)) await add(novelId);
        await addNovel(category.id, novelId);
    }

    return {
        entries,
        categories: cats,
        libError,
        catError,
        libraryIds,
        statusByNovel,
        toggleLibrary,
        changeStatus,
        toggleCategory,
        createCategoryWithNovel,
        // gestion des étagères elles-mêmes (page Bibliothèque)
        create,
        rename,
        removeCategory,
    };
}
