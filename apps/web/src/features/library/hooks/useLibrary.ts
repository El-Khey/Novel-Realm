import { useEffect, useState } from "react";
import {
    addToLibrary,
    getLibrary,
    removeFromLibrary,
} from "@/features/library/library.service";
import type { LibraryEntry, ReadingStatus } from "@/features/library/types";

function toMessage(e: unknown): string {
    return e instanceof Error ? e.message : "Erreur inconnue";
}

/**
 * Gère la bibliothèque de l'utilisateur connecté : chargement initial + les
 * mutations (ajout, changement de statut, retrait). Chaque mutation met à jour
 * l'état local une fois l'API confirmée — pas besoin de recharger toute la liste.
 */
export function useLibrary() {
    const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getLibrary()
            .then((data) => active && setEntries(data))
            .catch((e) => active && setError(toMessage(e)));
        return () => {
            active = false;
        };
    }, []);

    async function add(novelId: number, status?: ReadingStatus) {
        const entry = await addToLibrary(novelId, status);
        setEntries((prev) => [entry, ...(prev ?? [])]);
        return entry;
    }

    async function remove(novelId: number) {
        await removeFromLibrary(novelId);
        setEntries((prev) => prev?.filter((e) => e.novel.id !== novelId) ?? null);
    }

    return { entries, error, add, remove };
}
