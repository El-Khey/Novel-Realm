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

/** Sérialise les critères de recherche en query-string (`page`/`size` inclus). */
function toParams(query: NovelQuery, page: number, size: number): URLSearchParams {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (query.q) params.set("q", query.q);
  if (query.genreId != null) params.set("genreId", String(query.genreId));
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  return params;
}

// Les étagères de l'accueil n'ont pas besoin de pagination : on demande une
// grande page et on renvoie juste le contenu.
export function getNovels(query: NovelQuery = {}): Promise<Novel[]> {
  return request<PageResponse<Novel>>(`/novels?${toParams(query, 0, 60).toString()}`, {
    method: "GET",
  }).then((page) => page.content);
}

/**
 * Recherche paginée du catalogue : renvoie l'enveloppe complète
 * (`content`, `totalElements`, `totalPages`, …) pour piloter le défilement
 * infini et le compteur de la page Explorer.
 */
export function searchNovels(
  query: NovelQuery = {},
  page = 0,
  size = 24,
): Promise<PageResponse<Novel>> {
  return request<PageResponse<Novel>>(`/novels?${toParams(query, page, size).toString()}`, {
    method: "GET",
  });
}

export function getNovel(id: number): Promise<Novel> {
  return request<Novel>(`/novels/${id}`, { method: "GET" });
}
