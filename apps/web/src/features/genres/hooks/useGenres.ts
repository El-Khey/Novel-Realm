import { useEffect, useState } from "react";
import { getGenres } from "@/features/genres/genre.service";
import type { Genre } from "@/features/genres/types";

/** Liste des genres (pour la barre de filtres du catalogue). */
export function useGenres() {
    const [genres, setGenres] = useState<Genre[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getGenres()
            .then((data) => active && setGenres(data))
            .catch((e) => active && setError(e instanceof Error ? e.message : "Erreur inconnue"));
        return () => {
            active = false;
        };
    }, []);

    return { genres, error };
}
