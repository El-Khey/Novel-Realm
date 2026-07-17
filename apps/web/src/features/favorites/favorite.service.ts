import { request, requestNoContent } from "@/lib/http";
import type { ChapterFavorite } from "./types";

/** Points d'entrée HTTP des favoris de chapitre (toujours l'utilisateur connecté). */

/** Favoris de l'utilisateur sur les chapitres d'un roman. */
export function getNovelFavorites(novelId: number): Promise<ChapterFavorite[]> {
    return request<ChapterFavorite[]>(`/favorites/novels/${novelId}`, { method: "GET" });
}

/** Tous les chapitres favoris de l'utilisateur (tous romans confondus). */
export function getChapterFavorites(): Promise<ChapterFavorite[]> {
    return request<ChapterFavorite[]>("/favorites/chapters", { method: "GET" });
}

export function addChapterFavorite(chapterId: number): Promise<ChapterFavorite> {
    return request<ChapterFavorite>(`/favorites/chapters/${chapterId}`, { method: "POST" });
}

export function removeChapterFavorite(chapterId: number): Promise<void> {
    // 204 No Content → pas de corps à parser.
    return requestNoContent(`/favorites/chapters/${chapterId}`, { method: "DELETE" });
}
