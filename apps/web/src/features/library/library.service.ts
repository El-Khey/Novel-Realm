import { request, requestNoContent } from "@/lib/http";
import type { LibraryEntry, ReadingStatus } from "./types";

/** Points d'entrée HTTP de la feature bibliothèque (toujours l'utilisateur connecté). */

export function getLibrary(): Promise<LibraryEntry[]> {
    return request<LibraryEntry[]>("/library", { method: "GET" });
}

export function addToLibrary(novelId: number, status?: ReadingStatus): Promise<LibraryEntry> {
    return request<LibraryEntry>("/library", {
        method: "POST",
        body: JSON.stringify({ novelId, status }),
    });
}

export function updateLibraryStatus(
    novelId: number,
    status: ReadingStatus,
): Promise<LibraryEntry> {
    return request<LibraryEntry>(`/library/${novelId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export function removeFromLibrary(novelId: number): Promise<void> {
    // 204 No Content → pas de corps à parser.
    return requestNoContent(`/library/${novelId}`, { method: "DELETE" });
}
