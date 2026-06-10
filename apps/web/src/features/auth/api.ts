import { request, API_ORIGIN } from "@/lib/http";
import type { User } from "./types";

/** Points d'entrée HTTP de la feature auth. */

export function login(email: string, password: string): Promise<User | null> {
    return request<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export function register(pseudo: string, email: string, password: string): Promise<User | null> {
    return request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ pseudo, email, password }),
    });
}

export async function logout(): Promise<void> {
    await request("/auth/logout", { method: "POST" });
}

export function me(): Promise<User | null> {
    return request<User>("/users/me");
}

/**
 * Connexion via Google (OAuth2). Redirection plein écran vers l'endpoint
 * Spring Security du backend (hors préfixe `/api`) ; au retour, la session est
 * posée via cookie et l'app ré-hydrate l'utilisateur au montage.
 */
export function loginWithGoogle(): void {
    window.location.href = `${API_ORIGIN}/oauth2/authorization/google`;
}
