import { request } from "@/lib/http";
import type { Novel } from "./types";

/** Points d'entrée HTTP de la feature novels. */

export function getNovels(): Promise<Novel[]> {
  return request<Novel[]>("/novels", { method: "GET" });
}

export function getNovel(id: number): Promise<Novel> {
  return request<Novel>(`/novels/${id}`, { method: "GET" });
}