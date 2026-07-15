import { request } from "@/lib/http";
import type { Genre } from "./types";

/** Points d'entrée HTTP de la feature genres. */

export function getGenres(): Promise<Genre[]> {
    return request<Genre[]>("/genres", { method: "GET" });
}
