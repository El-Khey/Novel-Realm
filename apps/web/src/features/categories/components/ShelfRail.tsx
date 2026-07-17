import {
    Bookshelf01Icon,
    Folder01Icon,
    FolderAddIcon,
    PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

/** Onglet actif : "all" pour « Tous les romans », sinon l'id de l'étagère. */
export type ActiveShelf = "all" | number;

interface Props {
    categories: Category[];
    active: ActiveShelf;
    /** Nombre total de romans suivis (compteur de « Tous les romans »). */
    totalCount: number;
    onSelect: (shelf: ActiveShelf) => void;
    onCreateClick: () => void;
}

/**
 * Navigation des étagères, façon rail de playlists Spotify : une colonne
 * latérale sur desktop (≥ lg), des puces horizontales défilantes sur mobile.
 */
export function ShelfRail({ categories, active, totalCount, onSelect, onCreateClick }: Props) {
    return (
        <>
            {/* ── Rail latéral (desktop) ─────────────────────────────────── */}
            <nav
                aria-label="Étagères"
                className="sticky top-24 hidden self-start lg:block"
            >
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Étagères
                </p>

                <div className="mt-3 flex flex-col gap-0.5">
                    <RailItem
                        icon={Bookshelf01Icon}
                        label="Tous les romans"
                        count={totalCount}
                        active={active === "all"}
                        onClick={() => onSelect("all")}
                    />
                    {categories.map((category) => (
                        <RailItem
                            key={category.id}
                            icon={Folder01Icon}
                            label={category.name}
                            count={category.novels.length}
                            active={active === category.id}
                            onClick={() => onSelect(category.id)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onCreateClick}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/8 hover:text-foreground"
                >
                    <Icon icon={FolderAddIcon} size={16} />
                    Nouvelle étagère
                </button>
            </nav>

            {/* ── Puces horizontales (mobile / tablette) ─────────────────── */}
            <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 lg:hidden">
                <Chip
                    label="Tous les romans"
                    count={totalCount}
                    active={active === "all"}
                    onClick={() => onSelect("all")}
                />
                {categories.map((category) => (
                    <Chip
                        key={category.id}
                        label={category.name}
                        count={category.novels.length}
                        active={active === category.id}
                        onClick={() => onSelect(category.id)}
                    />
                ))}
                <button
                    type="button"
                    onClick={onCreateClick}
                    aria-label="Nouvelle étagère"
                    title="Nouvelle étagère"
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                    <Icon icon={PlusSignIcon} size={16} strokeWidth={2.2} />
                </button>
            </div>
        </>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

function RailItem({
    icon,
    label,
    count,
    active,
    onClick,
}: {
    icon: typeof Folder01Icon;
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? "true" : undefined}
            className={cn(
                "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                    ? "bg-white/8 font-semibold text-foreground"
                    : "font-medium text-muted-foreground hover:bg-white/4 hover:text-foreground",
            )}
        >
            {/* Indicateur d'étagère active */}
            <span
                className={cn(
                    "absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                )}
            />
            <Icon
                icon={icon}
                size={17}
                className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}
            />
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            <span
                className={cn(
                    "shrink-0 text-xs tabular-nums",
                    active ? "text-primary" : "text-muted-foreground/70",
                )}
            >
                {count}
            </span>
        </button>
    );
}

function Chip({
    label,
    count,
    active,
    onClick,
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
        >
            <span className="max-w-36 truncate">{label}</span>
            <span
                className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-white/20 text-primary-foreground" : "bg-background/60 text-muted-foreground",
                )}
            >
                {count}
            </span>
        </button>
    );
}
