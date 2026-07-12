/** Progression de lecture d'un chapitre — miroir de ChapterProgressResponse. */
export interface ChapterProgress {
    chapterId: number;
    read: boolean;
    scrollPosition: number;
    readAt: string;
}

/** Résumé de progression d'un roman — miroir de NovelProgressSummary. */
export interface NovelProgressSummary {
    novelId: number;
    totalChapters: number;
    readChapters: number;
}
