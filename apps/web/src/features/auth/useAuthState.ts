import { useEffect, useState } from "react";
import * as api from "../../service/auth.service";

export type User = {
    id: number;
    pseudo: string;
    email: string;
    createdAt: string;
};

export function useAuthState() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.me()
            .then((u) => setUser(u))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(email: string, password: string) {
        const u = await api.login(email, password);
        setUser(u);
    }

    async function logout() {
        await api.logout();
        setUser(null);
    }

    return { user, loading, login, logout };
}
