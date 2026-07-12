import type { Novel } from "@/features/novels/types";

/** Statut de lecture — miroir de LibraryEntry.ReadingStatus côté API. */
export type ReadingStatus = "PLAN_TO_READ" | "READING" | "COMPLETED" | "PAUSED";

/** Une entrée de bibliothèque — miroir de LibraryEntryResponse côté API. */
export interface LibraryEntry {
    novel: Novel;
    status: ReadingStatus;
    addedAt: string;
}
