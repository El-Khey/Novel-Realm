import { createContext } from "react";
import { type ReactNode } from "react";
import { type User } from "../../service/auth.service";
import { useAuthState } from "./hooks/useAuthState";


export type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const value = useAuthState();

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
