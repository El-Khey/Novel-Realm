/** Une entrée de l'historique de lecture — miroir de HistoryEntryResponse (back). */
export interface HistoryEntry {
    chapterId: number;
    chapterNumber: number;
    chapterTitle: string;
    novelId: number;
    novelTitle: string;
    novelCoverImageUrl: string | null;
    read: boolean;
    scrollPosition: number;
    readAt: string;
}

/** Tri de l'historique : par date (défaut) ou par roman. */
export type HistorySort = "date" | "novel";

/** Critères de la requête d'historique (tous optionnels). */
export interface HistoryQuery {
    novelId?: number;
    sort?: HistorySort;
    page?: number;
    size?: number;
}
