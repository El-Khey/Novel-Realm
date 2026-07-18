/** Un avis (note + commentaire) — miroir de ReviewResponse côté API. */
export interface Review {
    id: number;
    userId: number;
    pseudo: string;
    avatarUrl: string | null;
    /** Note de 1 à 5. */
    rating: number;
    /** Commentaire, ou null si l'utilisateur n'a mis qu'une note. */
    body: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Longueur max du commentaire — alignée sur la validation du backend. */
export const REVIEW_BODY_MAX = 2000;

/**
 * Synthèse des avis d'un roman. `distribution` contient toujours les cinq
 * notes (clés "1" à "5"), à 0 le cas échéant.
 */
export interface ReviewSummary {
    average: number;
    count: number;
    distribution: Record<string, number>;
}

/** Étiquette qualitative d'une note, affichée à côté des étoiles. */
export const RATING_LABELS: Record<number, string> = {
    5: "Chef-d'œuvre",
    4: "Excellent",
    3: "Correct",
    2: "Mitigé",
    1: "Décevant",
};
