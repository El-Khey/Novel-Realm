import { useEffect, useState } from "react";
import * as authApi from "@/features/auth/auth.service";
import type { User } from "@/features/auth/types";
import type { AuthContextType } from "@/features/auth/context";

/**
 * Source de vérité de la session : hydrate l'utilisateur courant au montage
 * (via `me()`) et expose les actions qui modifient cet état (login/logout).
 */
export function useAuthState(): AuthContextType {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi
            .me()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(email: string, password: string) {
        setUser(await authApi.login(email, password));
    }

    async function logout() {
        await authApi.logout();
        setUser(null);
    }

    return { user, loading, login, logout };
}
