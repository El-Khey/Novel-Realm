import { useCallback, useEffect, useState } from "react";
import * as authApi from "@/features/auth/auth.service";
import type { User } from "@/features/auth/types";
import type { AuthContextType } from "@/features/auth/context";
import { hydratePreferences } from "@/features/profile/preferences";

/**
 * Source de vérité de la session : hydrate l'utilisateur courant au montage
 * (via `me()`) et expose les actions qui modifient cet état (login/logout).
 * Au passage, les préférences du compte (accent, réglages du lecteur) sont
 * appliquées à l'appareil.
 */
export function useAuthState(): AuthContextType {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi
            .me()
            .then((me) => {
                setUser(me);
                hydratePreferences(me.preferences);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(email: string, password: string) {
        const logged = await authApi.login(email, password);
        setUser(logged);
        hydratePreferences(logged.preferences);
    }

    async function logout() {
        await authApi.logout();
        setUser(null);
    }

    /** Remplace l'utilisateur en mémoire (après une mutation du profil). */
    const updateUser = useCallback((next: User) => setUser(next), []);

    return { user, loading, login, logout, updateUser };
}
