import { cn } from "@/lib/utils";
import type { Genre } from "@/features/genres/types";

interface Props {
    genres: Genre[];
    /** Genre sélectionné, ou null pour « Tous ». */
    activeId: number | null;
    onSelect: (genreId: number | null) => void;
}

function pillClass(isActive: boolean) {
    return cn(
        "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
    );
}

/** Barre de filtres par genre, cliquable, avec « Tous » pour tout réafficher. */
export function GenreBar({ genres, activeId, onSelect }: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            <button type="button" className={pillClass(activeId === null)} onClick={() => onSelect(null)}>
                Tous
            </button>
            {genres.map((genre) => (
                <button
                    key={genre.id}
                    type="button"
                    className={pillClass(activeId === genre.id)}
                    onClick={() => onSelect(genre.id)}
                >
                    {genre.name}
                </button>
            ))}
        </div>
    );
}
