import { useEffect, useState } from "react";
import { getNovels } from "@/features/novels/novel.service";
import type { Novel } from "@/features/novels/types";

/**
 * Catalogue de romans. Si `genreId` est fourni, filtre par genre côté API ;
 * recharge automatiquement quand le genre sélectionné change.
 */
export function useNovels(genreId?: number) {
    const [novels, setNovels] = useState<Novel[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setNovels(null); // repasse en état « chargement » à chaque changement de genre
        setError(null);
        getNovels(genreId)
            .then((data) => active && setNovels(data))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, [genreId]);

    return { novels, error };
}
