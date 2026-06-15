import { useEffect, useState } from "react";
import { getNovels } from "@/features/novels/novel.service";
import type { Novel } from "@/features/novels/types";

export function useNovels() {
    const [novels, setNovels] = useState<Novel[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getNovels()
            .then((data) => active && setNovels(data))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, []);

    return { novels, error };
}