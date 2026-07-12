import { request } from "@/lib/http";
import type { Novel } from "./types";

/** Points d'entrée HTTP de la feature novels. */

export function getNovels(genreId?: number): Promise<Novel[]> {
  const query = genreId != null ? `?genreId=${genreId}` : "";
  return request<Novel[]>(`/novels${query}`, { method: "GET" });
}

export function getNovel(id: number): Promise<Novel> {
  return request<Novel>(`/novels/${id}`, { method: "GET" });
}