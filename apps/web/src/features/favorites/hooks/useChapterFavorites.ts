import { useCallback, useEffect, useState } from "react";
import {
    addChapterFavorite,
    getNovelFavorites,
    removeChapterFavorite,
} from "@/features/favorites/favorite.service";

/**
 * Favoris (marque-pages) de l'utilisateur sur les chapitres d'un roman.
 *
 * <p>Expose l'ensemble des ids favoris (`favoriteIds`) et `toggleFavorite` :
 * mise à jour optimiste (on bascule tout de suite), annulée si l'API échoue.
 */
export function useChapterFavorites(novelId: number) {
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let active = true;
        setLoaded(false);
        getNovelFavorites(novelId)
            .then((list) => {
                if (!active) return;
                setFavoriteIds(new Set(list.map((f) => f.chapterId)));
            })
            .catch(() => {
                /* pas de favoris / erreur réseau : on garde un ensemble vide */
            })
            .finally(() => active && setLoaded(true));
        return () => {
            active = false;
        };
    }, [novelId]);

    const toggleFavorite = useCallback(
        async (chapterId: number) => {
            const willAdd = !favoriteIds.has(chapterId);
            // Optimiste : on bascule l'UI immédiatement.
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (willAdd) next.add(chapterId);
                else next.delete(chapterId);
                return next;
            });
            try {
                if (willAdd) await addChapterFavorite(chapterId);
                else await removeChapterFavorite(chapterId);
            } catch {
                // Échec : on annule le basculement.
                setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    if (willAdd) next.delete(chapterId);
                    else next.add(chapterId);
                    return next;
                });
            }
        },
        [favoriteIds],
    );

    return { favoriteIds, toggleFavorite, loaded };
}
