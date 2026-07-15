import { useEffect, useState } from "react";
import { getProgressSummary } from "@/features/progress/progress.service";

/**
 * Résumé de progression de tous les romans. Expose une map
 * {@code novelId → chapitres restants} (total − lus) pour annoter les cartes.
 */
export function useProgressSummary() {
    const [remainingByNovel, setRemainingByNovel] = useState<Map<number, number>>(new Map());

    useEffect(() => {
        let active = true;
        getProgressSummary()
            .then((list) => {
                if (!active) return;
                const map = new Map<number, number>();
                for (const s of list) {
                    map.set(s.novelId, Math.max(0, s.totalChapters - s.readChapters));
                }
                setRemainingByNovel(map);
            })
            .catch(() => {
                /* silencieux : l'absence de badge n'est pas bloquante */
            });
        return () => {
            active = false;
        };
    }, []);

    return { remainingByNovel };
}
