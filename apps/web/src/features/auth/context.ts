import { createContext } from "react";
import type { User } from "./types";

export type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    /** Remplace l'utilisateur en mémoire (après une mutation du profil : avatar, pseudo…). */
    updateUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
