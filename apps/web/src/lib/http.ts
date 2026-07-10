/**
 * Client HTTP générique, partagé par toutes les features.
 * - Préfixe automatiquement les requêtes par `${VITE_API_URL}/api`.
 * - Envoie/reçoit du JSON et inclut les cookies (`credentials: "include"`).
 * - Lève une `ApiError` (portant le code HTTP) quand la réponse n'est pas OK.
 */

export const API_ORIGIN = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const BASE_URL = `${API_ORIGIN}/api`;

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

/**
 * Cœur commun : exécute la requête, gère les erreurs, renvoie la Response brute.
 * Privée : les features utilisent `request` ou `requestNoContent` ci-dessous.
 */
async function doFetch(path: string, options: RequestOptions = {}): Promise<Response> {
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

    return response;
}

/**
 * Pour les requêtes qui renvoient un corps JSON (GET, POST avec réponse…).
 * Retourne directement `T`, jamais null.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await doFetch(path, options);
    return response.json() as Promise<T>;
}

/**
 * Pour les requêtes sans corps de réponse (204 No Content, ex. logout).
 * Ne retourne rien.
 */
export async function requestNoContent(path: string, options: RequestOptions = {}): Promise<void> {
    await doFetch(path, options);
}