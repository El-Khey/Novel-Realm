import { useEffect, useState } from "react";
import { getNovels, type NovelQuery } from "@/features/novels/novel.service";
import type { Novel } from "@/features/novels/types";

/**
 * Catalogue de romans. Applique les critères de recherche/filtre/tri côté API
 * et recharge automatiquement quand l'un d'eux change.
 */
export function useNovels(query: NovelQuery = {}) {
    const { q, genreId, status, sort } = query;
    const [novels, setNovels] = useState<Novel[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setNovels(null); // repasse en « chargement » à chaque changement de critère
        setError(null);
        getNovels({ q, genreId, status, sort })
            .then((data) => active && setNovels(data))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, [q, genreId, status, sort]);

    return { novels, error };
}
