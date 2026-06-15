import { request } from "@/lib/http";
import type { Chapter } from "./types";

/** Points d'entrée HTTP des chapitres. */

export function getChaptersByNovel(novelId: number): Promise<Chapter[]> {
    return request<Chapter[]>(`/chapters/novel/${novelId}`, { method: "GET" });
}
