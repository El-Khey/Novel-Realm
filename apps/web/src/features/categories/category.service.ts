import { request, requestNoContent } from "@/lib/http";
import type { Category } from "./types";

/** Points d'entrée HTTP de la feature étagères (toujours l'utilisateur connecté). */

export function getCategories(): Promise<Category[]> {
    return request<Category[]>("/categories", { method: "GET" });
}

export function createCategory(name: string): Promise<Category> {
    return request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export function renameCategory(id: number, name: string): Promise<Category> {
    return request<Category>(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });
}

export function deleteCategory(id: number): Promise<void> {
    return requestNoContent(`/categories/${id}`, { method: "DELETE" });
}

export function addNovelToCategory(id: number, novelId: number): Promise<Category> {
    return request<Category>(`/categories/${id}/novels`, {
        method: "POST",
        body: JSON.stringify({ novelId }),
    });
}

export function removeNovelFromCategory(id: number, novelId: number): Promise<void> {
    return requestNoContent(`/categories/${id}/novels/${novelId}`, { method: "DELETE" });
}
