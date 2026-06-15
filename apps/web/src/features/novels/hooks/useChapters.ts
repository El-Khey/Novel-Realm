import { useEffect, useState } from "react";
import { getChaptersByNovel } from "@/features/novels/chapter.service";
import type { Chapter } from "@/features/novels/types";

/** Liste plate des chapitres d'un roman (déjà triée par numéro côté API). */
export function useChapters(novelId: number) {
    const [chapters, setChapters] = useState<Chapter[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getChaptersByNovel(novelId)
            .then((data) => active && setChapters(data))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, [novelId]);

    return { chapters, error };
}
