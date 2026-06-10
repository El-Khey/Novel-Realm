/**
 * Client HTTP générique, partagé par toutes les features.
 * - Préfixe automatiquement les requêtes par `${VITE_API_URL}/api`.
 * - Envoie/reçoit du JSON et inclut les cookies (`credentials: "include"`).
 * - Lève une `ApiError` (portant le code HTTP) quand la réponse n'est pas OK.
 */

/** Origine du serveur API (ex. http://localhost:8080), sans le préfixe `/api`. */
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const BASE_URL = `${API_ORIGIN}/api`;

/** Erreur applicative portant le statut HTTP, pour un traitement fin (401, 409, …). */
export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
    headers?: Record<string, string>;
}

interface ErrorBody {
    message?: string;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
    const response = await fetch(BASE_URL + path, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const body: ErrorBody = await response.json().catch(() => ({}));
        throw new ApiError(response.status, body.message ?? "Erreur réseau");
    }

    // 204 No Content (ex. logout) → pas de corps à parser.
    if (response.status === 204) return null;

    return response.json() as Promise<T>;
}
