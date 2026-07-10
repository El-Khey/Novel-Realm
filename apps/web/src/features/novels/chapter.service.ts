import { request } from "@/lib/http";
import type { Chapter, ChapterDetail } from "./types";

/** Points d'entrée HTTP des chapitres. */

export function getChaptersByNovel(novelId: number): Promise<Chapter[]> {
    return request<Chapter[]>(`/chapters/novel/${novelId}`, { method: "GET" });
}

export function getChapter(id: number): Promise<ChapterDetail> {
    return request<ChapterDetail>(`/chapters/${id}`, { method: "GET" });
}
