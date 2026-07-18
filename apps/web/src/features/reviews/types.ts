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
