import type { ReadingStatus } from "./types";

/**
 * Métadonnées d'affichage du statut de LECTURE d'une entrée de bibliothèque
 * (à ne pas confondre avec le statut de PARUTION du roman, cf.
 * features/novels/status.ts). Le point coloré est le seul signal de couleur :
 * les pastilles restent neutres, conformément à DESIGN.md.
 */
type ReadingStatusMeta = { label: string; dot: string };

export const READING_STATUS: Record<ReadingStatus, ReadingStatusMeta> = {
    READING: { label: "En cours", dot: "bg-primary" },
    PLAN_TO_READ: { label: "À lire", dot: "bg-sky-400" },
    COMPLETED: { label: "Terminé", dot: "bg-emerald-400" },
    PAUSED: { label: "En pause", dot: "bg-amber-400" },
};

/** Ordre d'affichage canonique des statuts (filtres, menus). */
export const READING_STATUS_ORDER: ReadingStatus[] = [
    "READING",
    "PLAN_TO_READ",
    "COMPLETED",
    "PAUSED",
];
