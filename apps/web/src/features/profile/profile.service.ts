import { request, requestNoContent, requestUpload } from "@/lib/http";
import type { User } from "@/features/auth/types";
import type { UserStats } from "./types";

/** Points d'entrée HTTP de la page profil (toujours l'utilisateur connecté). */

export interface ProfilePatch {
    pseudo?: string;
    bio?: string;
    /** Objet JSON opaque (accent, réglages du lecteur…) ; null = effacer. */
    preferences?: unknown;
}

/** Mise à jour partielle du profil (les champs absents ne bougent pas). */
export function updateProfile(patch: ProfilePatch): Promise<User> {
    return request<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(patch),
    });
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // 204 No Content → pas de corps à parser.
    return requestNoContent("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export function getMyStats(): Promise<UserStats> {
    return request<UserStats>("/users/me/stats");
}

/**
 * Supprime DÉFINITIVEMENT le compte et toutes les données rattachées.
 * Le serveur ferme la session au passage : l'appelant n'a plus qu'à nettoyer
 * l'état local et rediriger.
 */
export function deleteAccount(): Promise<void> {
    return requestNoContent("/users/me", { method: "DELETE" });
}

// ── Avatar & bannière (multipart) ───────────────────────────────────

export function uploadAvatar(file: File): Promise<User> {
    const form = new FormData();
    form.append("file", file);
    return requestUpload<User>("/users/me/avatar", form);
}

export function deleteAvatar(): Promise<User> {
    return request<User>("/users/me/avatar", { method: "DELETE" });
}

export function uploadBanner(file: File): Promise<User> {
    const form = new FormData();
    form.append("file", file);
    return requestUpload<User>("/users/me/banner", form);
}

export function deleteBanner(): Promise<User> {
    return request<User>("/users/me/banner", { method: "DELETE" });
}
