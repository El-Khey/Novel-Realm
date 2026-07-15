import { request, type PageResponse } from "@/lib/http";
import type { Novel } from "./types";

/** Points d'entrée HTTP de la feature novels. */

/** Critères de recherche/filtre/tri du catalogue (tous optionnels). */
export interface NovelQuery {
  q?: string;
  genreId?: number;
  status?: Novel["status"];
  sort?: "recent" | "title" | "popularity";
}

// Le catalogue est paginé côté API. Tant que le front n'a pas sa propre
// pagination, on demande une grande page et on renvoie juste le contenu.
export function getNovels(query: NovelQuery = {}): Promise<Novel[]> {
  const params = new URLSearchParams({ size: "60" });
  if (query.q) params.set("q", query.q);
  if (query.genreId != null) params.set("genreId", String(query.genreId));
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  return request<PageResponse<Novel>>(`/novels?${params.toString()}`, { method: "GET" }).then(
    (page) => page.content,
  );
}

export function getNovel(id: number): Promise<Novel> {
  return request<Novel>(`/novels/${id}`, { method: "GET" });
}
