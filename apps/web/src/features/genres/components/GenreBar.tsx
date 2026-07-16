import { useEffect, useRef, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
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

/**
 * Barre de filtres par genre sur UNE SEULE ligne défilante, avec flèches
 * (comme les étagères). Le défilement natif garde toutes les pastilles
 * accessibles au clavier (pas d'`inert`) ; les flèches ne sont qu'un confort.
 */
export function GenreBar({ genres, activeId, onSelect }: Props) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    function refresh() {
        const el = scrollerRef.current;
        if (!el) return;
        setCanPrev(el.scrollLeft > 4);
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    useEffect(() => {
        refresh();
        const el = scrollerRef.current;
        if (!el) return;
        el.addEventListener("scroll", refresh, { passive: true });
        window.addEventListener("resize", refresh);
        return () => {
            el.removeEventListener("scroll", refresh);
            window.removeEventListener("resize", refresh);
        };
    }, [genres]);

    function nudge(dir: -1 | 1) {
        scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
    }

    return (
        <div className="relative">
            <div ref={scrollerRef} className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth">
                <button
                    type="button"
                    className={pillClass(activeId === null)}
                    onClick={() => onSelect(null)}
                >
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

            {canPrev && <Arrow dir="left" onClick={() => nudge(-1)} />}
            {canNext && <Arrow dir="right" onClick={() => nudge(1)} />}
        </div>
    );
}

function Arrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-hidden
            tabIndex={-1}
            className={cn(
                "absolute top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full",
                "bg-popover text-foreground shadow-lg ring-1 ring-white/10 transition hover:bg-accent",
                dir === "left" ? "left-0" : "right-0",
            )}
        >
            <Icon
                icon={dir === "left" ? ArrowLeft01Icon : ArrowRight01Icon}
                size={15}
                strokeWidth={2.4}
            />
        </button>
    );
}
