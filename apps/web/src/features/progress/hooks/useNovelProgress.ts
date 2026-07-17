import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getNovelProgress,
    saveChapterPosition,
    setChapterRead,
    setChaptersReadBatch,
} from "@/features/progress/progress.service";
import type { ChapterProgress } from "@/features/progress/types";

/**
 * Progression de lecture de l'utilisateur sur un roman.
 *
 * <p>Expose la progression par chapitre (`progressById`), l'ensemble des ids lus
 * (`readIds`, dérivé), et les actions `setRead` / `savePosition` qui persistent
 * puis mettent à jour l'état local. `loaded` indique que le chargement initial
 * est terminé (utile pour restaurer la position de reprise au bon moment).
 */
export function useNovelProgress(novelId: number) {
    const [progressById, setProgressById] = useState<Map<number, ChapterProgress>>(new Map());
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoaded(false);
        getNovelProgress(novelId)
            .then((list) => {
                if (!active) return;
                setProgressById(new Map(list.map((p) => [p.chapterId, p])));
            })
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"))
            .finally(() => active && setLoaded(true));
        return () => {
            active = false;
        };
    }, [novelId]);

    const readIds = useMemo(
        () => new Set([...progressById.values()].filter((p) => p.read).map((p) => p.chapterId)),
        [progressById],
    );

    function upsert(progress: ChapterProgress) {
        setProgressById((prev) => new Map(prev).set(progress.chapterId, progress));
    }

    const setRead = useCallback(async (chapterId: number, read: boolean) => {
        upsert(await setChapterRead(chapterId, read));
    }, []);

    /** Marque un lot de chapitres lus / non lus (sélection multiple) puis fusionne le résultat. */
    const setReadBatch = useCallback(async (chapterIds: number[], read: boolean) => {
        if (chapterIds.length === 0) return;
        const updated = await setChaptersReadBatch(chapterIds, read);
        setProgressById((prev) => {
            const next = new Map(prev);
            for (const p of updated) next.set(p.chapterId, p);
            return next;
        });
    }, []);

    const savePosition = useCallback(async (chapterId: number, percent: number) => {
        upsert(await saveChapterPosition(chapterId, percent));
    }, []);

    return { progressById, readIds, loaded, error, setRead, setReadBatch, savePosition };
}
