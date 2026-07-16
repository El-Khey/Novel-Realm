import { useCallback, useEffect, useState } from "react";
import type { PageResponse } from "@/lib/http";
import { clearHistory, clearNovelHistory, getHistory } from "../history.service";
import type { HistoryEntry, HistorySort } from "../types";

const PAGE_SIZE = 15;

/**
 * Pilote l'historique de lecture : tri, filtre par roman, pagination, et purges.
 * Recharge automatiquement quand un critère change ; expose des actions qui
 * rafraîchissent la liste après suppression.
 */
export function useHistory() {
    const [sort, setSortState] = useState<HistorySort>("date");
    const [novelId, setNovelIdState] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const [data, setData] = useState<PageResponse<HistoryEntry> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0); // bump = re-fetch forcé (après purge)

    useEffect(() => {
        let active = true;
        setData(null); // repasse en « chargement »
        setError(null);
        getHistory({ sort, novelId: novelId ?? undefined, page, size: PAGE_SIZE })
            .then((res) => active && setData(res))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, [sort, novelId, page, reload]);

    // Changer le tri ou le filtre ramène à la première page.
    const setSort = useCallback((next: HistorySort) => {
        setSortState(next);
        setPage(0);
    }, []);
    const setNovelId = useCallback((next: number | null) => {
        setNovelIdState(next);
        setPage(0);
    }, []);

    const clearAll = useCallback(async () => {
        await clearHistory();
        setNovelIdState(null);
        setPage(0);
        setReload((n) => n + 1);
    }, []);

    const clearNovel = useCallback(async (id: number) => {
        await clearNovelHistory(id);
        setPage(0);
        setReload((n) => n + 1);
    }, []);

    return { data, error, sort, setSort, novelId, setNovelId, page, setPage, clearAll, clearNovel };
}
