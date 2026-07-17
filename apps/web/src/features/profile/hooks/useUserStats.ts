import { useEffect, useState } from "react";
import { getMyStats } from "@/features/profile/profile.service";
import type { UserStats } from "@/features/profile/types";

/** Statistiques de lecture de l'utilisateur connecté (bandeau du profil). */
export function useUserStats() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getMyStats()
            .then((data) => active && setStats(data))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, []);

    return { stats, error };
}
