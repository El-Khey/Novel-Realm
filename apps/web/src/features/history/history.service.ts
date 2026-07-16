import { request, requestNoContent, type PageResponse } from "@/lib/http";
import type { HistoryEntry, HistoryQuery } from "./types";

/** Points d'entrée HTTP de l'historique de lecture (utilisateur connecté). */

const DEFAULT_SIZE = 15;

/** Page d'historique, filtrée/triée selon les critères. */
export function getHistory(query: HistoryQuery = {}): Promise<PageResponse<HistoryEntry>> {
    const params = new URLSearchParams();
    if (query.novelId != null) params.set("novelId", String(query.novelId));
    if (query.sort) params.set("sort", query.sort);
    params.set("page", String(query.page ?? 0));
    params.set("size", String(query.size ?? DEFAULT_SIZE));
    return request<PageResponse<HistoryEntry>>(`/history?${params.toString()}`, { method: "GET" });
}

/** Vide tout l'historique de l'utilisateur. */
export function clearHistory(): Promise<void> {
    return requestNoContent("/history", { method: "DELETE" });
}

/** Vide l'historique d'un roman précis. */
export function clearNovelHistory(novelId: number): Promise<void> {
    return requestNoContent(`/history/novels/${novelId}`, { method: "DELETE" });
}
