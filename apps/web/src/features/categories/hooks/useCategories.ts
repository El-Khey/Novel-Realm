import { useEffect, useState } from "react";
import {
    addNovelToCategory,
    createCategory,
    deleteCategory,
    getCategories,
    removeNovelFromCategory,
    renameCategory,
} from "@/features/categories/category.service";
import type { Category } from "@/features/categories/types";

function toMessage(e: unknown): string {
    return e instanceof Error ? e.message : "Erreur inconnue";
}

/**
 * Gère les étagères de l'utilisateur connecté : chargement initial + mutations
 * (créer, renommer, supprimer, ajouter/retirer un roman). Chaque mutation met à
 * jour l'état local à partir de la réponse de l'API — pas de rechargement global.
 */
export function useCategories() {
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getCategories()
            .then((data) => active && setCategories(data))
            .catch((e) => active && setError(toMessage(e)));
        return () => {
            active = false;
        };
    }, []);

    /** Remplace une étagère (par id) par sa version à jour. */
    function replace(updated: Category) {
        setCategories((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null);
    }

    async function create(name: string) {
        const category = await createCategory(name);
        setCategories((prev) => [...(prev ?? []), category]);
        return category;
    }

    async function rename(id: number, name: string) {
        replace(await renameCategory(id, name));
    }

    async function remove(id: number) {
        await deleteCategory(id);
        setCategories((prev) => prev?.filter((c) => c.id !== id) ?? null);
    }

    async function addNovel(id: number, novelId: number) {
        replace(await addNovelToCategory(id, novelId));
    }

    async function removeNovel(id: number, novelId: number) {
        await removeNovelFromCategory(id, novelId);
        setCategories((prev) =>
            prev?.map((c) =>
                c.id === id ? { ...c, novels: c.novels.filter((n) => n.id !== novelId) } : c,
            ) ?? null,
        );
    }

    return { categories, error, create, rename, remove, addNovel, removeNovel };
}
