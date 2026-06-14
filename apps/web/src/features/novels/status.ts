import type { Novel } from "./types";

/**
 * Métadonnées d'affichage du statut d'un roman.
 * Tons neutres volontairement (cf. DESIGN.md) : le jaune reste réservé aux CTA,
 * le vert/rouge aux signaux de prix — pas aux états génériques.
 */
type NovelStatusMeta = { label: string; variant: "outline" | "secondary" };

export const NOVEL_STATUS: Record<Novel["status"], NovelStatusMeta> = {
    ONGOING: { label: "En cours", variant: "outline" },
    COMPLETED: { label: "Terminé", variant: "secondary" },
};
