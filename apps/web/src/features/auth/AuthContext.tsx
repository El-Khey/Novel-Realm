import { createContext, useContext, useEffect, useState } from "react";
import { type ReactNode } from "react";
import * as api from "../../service/auth.service";

type User = {
    id: number;
    pseudo: string;
    email: string;
    createdAt: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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

    const value = { user, loading, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
    }
    return context;
}