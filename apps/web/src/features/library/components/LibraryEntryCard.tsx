import { useState } from "react";
import { NovelCard } from "@/features/novels/components/NovelCard";
import type { LibraryEntry } from "@/features/library/types";

interface Props {
    entry: LibraryEntry;
    onRemove: (novelId: number) => Promise<void>;
}

/**
 * Une entrée de la bibliothèque : la carte du roman (cliquable vers sa fiche)
 * avec un bouton « retirer » en coin.
 *
 * <p>Le bouton est un frère de la carte-lien (pas imbriqué dedans) : HTML valide
 * + le clic ne déclenche pas l'ouverture de la fiche du roman.
 */
export function LibraryEntryCard({ entry, onRemove }: Props) {
    const [busy, setBusy] = useState(false);

    async function handleRemove() {
        setBusy(true);
        try {
            await onRemove(entry.novel.id);
        } catch {
            setBusy(false); // en cas d'échec la carte reste affichée
        }
    }

    return (
        <div className="relative">
            <NovelCard novel={entry.novel} />
            <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                aria-label="Retirer de ma bibliothèque"
                className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-md bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-destructive/20 hover:text-destructive disabled:opacity-50"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                    aria-hidden="true"
                >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                </svg>
            </button>
        </div>
    );
}
