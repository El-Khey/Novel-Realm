import { request } from "@/lib/http";
import type { ChapterProgress, NovelProgressSummary } from "./types";

/** Points d'entrée HTTP de la progression de lecture (utilisateur connecté). */

export function getNovelProgress(novelId: number): Promise<ChapterProgress[]> {
    return request<ChapterProgress[]>(`/progress/novels/${novelId}`, { method: "GET" });
}

export function setChapterRead(chapterId: number, read: boolean): Promise<ChapterProgress> {
    return request<ChapterProgress>(`/progress/chapters/${chapterId}`, {
        method: "PUT",
        body: JSON.stringify({ read }),
    });
}

/** Sauvegarde la position de reprise (0–100 %). 100 % marque le chapitre lu. */
export function saveChapterPosition(chapterId: number, percent: number): Promise<ChapterProgress> {
    return request<ChapterProgress>(`/progress/chapters/${chapterId}/position`, {
        method: "PUT",
        body: JSON.stringify({ percent }),
    });
}

/** Résumé (total + lus) par roman, pour afficher les chapitres restants. */
export function getProgressSummary(): Promise<NovelProgressSummary[]> {
    return request<NovelProgressSummary[]>("/progress/summary", { method: "GET" });
}
