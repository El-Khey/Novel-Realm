import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown01Icon,
    ArrowUpDownIcon,
    Bookmark02Icon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    CheckmarkSquare01Icon,
    Search01Icon,
    SquareIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { Chapter } from "@/features/novels/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
    novelId: number;
    chapters: Chapter[] | null;
    error: string | null;
    readIds: Set<number>;
    favoriteIds: Set<number>;
    /** Marque un chapitre lu / non lu. */
    onToggleRead: (chapterId: number, read: boolean) => void;
    /** Ajoute / retire un chapitre des favoris. */
    onToggleFavorite: (chapterId: number) => void;
    /** Marque un lot de chapitres lus / non lus (sélection multiple). */
    onMarkBatch: (chapterIds: number[], read: boolean) => void | Promise<void>;
}

type SortDir = "asc" | "desc";

/**
 * Liste des chapitres : recherche (n° ou titre), tri croissant/décroissant,
 * favori et lu/non-lu par chapitre, et un mode sélection multiple (tout
 * sélectionner, sélectionner à partir d'un chapitre, marquage en masse).
 */
export function ChapterList({
    novelId,
    chapters,
    error,
    readIds,
    favoriteIds,
    onToggleRead,
    onToggleFavorite,
    onMarkBatch,
}: Props) {
    const [query, setQuery] = useState("");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    // Filtre (n° ou titre) puis tri par numéro dans le sens choisi.
    const visible = useMemo(() => {
        if (!chapters) return [];
        const q = query.trim().toLowerCase();
        const filtered = q
            ? chapters.filter(
                  (c) => String(c.chapterNumber).includes(q) || c.title.toLowerCase().includes(q),
              )
            : chapters;
        return [...filtered].sort((a, b) =>
            sortDir === "asc" ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber,
        );
    }, [chapters, query, sortDir]);

    const visibleIds = useMemo(() => visible.map((c) => c.id), [visible]);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    const selectedCount = selected.size;

    function toggleSelect(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    // Sélectionne ce chapitre + tous ceux affichés en dessous.
    function selectFrom(index: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            for (let i = index; i < visible.length; i++) next.add(visible[i].id);
            return next;
        });
    }

    function toggleSelectAll() {
        setSelected(new Set(allSelected ? [] : visibleIds));
    }

    function exitSelectMode() {
        setSelectMode(false);
        setSelected(new Set());
    }

    async function markSelected(read: boolean) {
        const ids = [...selected];
        if (ids.length === 0) return;
        await onMarkBatch(ids, read);
        exitSelectMode();
    }

    return (
        <section className="border-t border-border pt-6">
            {/* Barre d'outils */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="flex items-baseline gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Chapitres
                    {chapters && (
                        <span className="text-sm font-semibold text-foreground/70 normal-case tracking-normal">
                            {chapters.length}
                        </span>
                    )}
                </h2>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    {/* Recherche */}
                    <div className="relative">
                        <Icon
                            icon={Search01Icon}
                            size={15}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="N° ou titre…"
                            aria-label="Rechercher un chapitre"
                            className="h-8 w-40 rounded-md border border-border bg-input/30 pl-8 pr-2.5 text-sm outline-none transition-colors focus:border-ring/60 sm:w-48"
                        />
                    </div>

                    {/* Tri */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                        title="Inverser l'ordre"
                    >
                        <Icon icon={ArrowUpDownIcon} size={15} />
                        {sortDir === "asc" ? "Croissant" : "Décroissant"}
                    </Button>

                    {/* Sélection multiple */}
                    {!selectMode ? (
                        <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                            Sélectionner
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={exitSelectMode}>
                            <Icon icon={Cancel01Icon} size={15} />
                            Annuler
                        </Button>
                    )}
                </div>
            </div>

            {/* Barre d'actions de sélection */}
            {selectMode && (
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-card px-3 py-2">
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                        <Icon
                            icon={allSelected ? CheckmarkSquare01Icon : SquareIcon}
                            size={17}
                            className={allSelected ? "text-primary" : "text-muted-foreground"}
                        />
                        {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                    <span className="text-sm text-muted-foreground">
                        {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => markSelected(true)}
                            disabled={selectedCount === 0}
                        >
                            Marquer lu
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markSelected(false)}
                            disabled={selectedCount === 0}
                        >
                            Marquer non lu
                        </Button>
                    </div>
                </div>
            )}

            {/* Liste */}
            {error ? (
                <p className="text-sm text-destructive">Impossible de charger les chapitres : {error}</p>
            ) : chapters === null ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : chapters.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun chapitre pour le moment.</p>
            ) : visible.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun chapitre ne correspond à « {query} ».</p>
            ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                    {visible.map((chapter, index) => (
                        <ChapterRow
                            key={chapter.id}
                            novelId={novelId}
                            chapter={chapter}
                            isRead={readIds.has(chapter.id)}
                            isFavorite={favoriteIds.has(chapter.id)}
                            selectMode={selectMode}
                            isSelected={selected.has(chapter.id)}
                            onToggleRead={onToggleRead}
                            onToggleFavorite={onToggleFavorite}
                            onToggleSelect={() => toggleSelect(chapter.id)}
                            onSelectFrom={() => selectFrom(index)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

/* -------------------------------- ligne -------------------------------- */

interface RowProps {
    novelId: number;
    chapter: Chapter;
    isRead: boolean;
    isFavorite: boolean;
    selectMode: boolean;
    isSelected: boolean;
    onToggleRead: (chapterId: number, read: boolean) => void;
    onToggleFavorite: (chapterId: number) => void;
    onToggleSelect: () => void;
    onSelectFrom: () => void;
}

function ChapterRow({
    novelId,
    chapter,
    isRead,
    isFavorite,
    selectMode,
    isSelected,
    onToggleRead,
    onToggleFavorite,
    onToggleSelect,
    onSelectFrom,
}: RowProps) {
    // Mode sélection : toute la ligne bascule la case, une action « à partir d'ici ».
    if (selectMode) {
        return (
            <li className={cn("flex items-center gap-2 px-3 py-2 text-sm", isSelected && "bg-primary/8")}>
                <button
                    type="button"
                    onClick={onToggleSelect}
                    aria-pressed={isSelected}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <Icon
                        icon={isSelected ? CheckmarkSquare01Icon : SquareIcon}
                        size={18}
                        className={isSelected ? "text-primary" : "text-muted-foreground"}
                    />
                    <span className="w-10 shrink-0 tabular-nums text-muted-foreground">
                        {chapter.chapterNumber}
                    </span>
                    <span className={cn("truncate", isRead && "text-muted-foreground")}>
                        {chapter.title}
                    </span>
                    {isFavorite && (
                        <Icon icon={Bookmark02Icon} size={14} className="shrink-0 fill-current text-primary" />
                    )}
                    {isRead && (
                        <Icon icon={CheckmarkCircle02Icon} size={14} className="shrink-0 text-primary" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={onSelectFrom}
                    title="Sélectionner à partir d'ici"
                    aria-label="Sélectionner à partir d'ici"
                    className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                    <Icon icon={ArrowDown01Icon} size={17} />
                </button>
            </li>
        );
    }

    // Mode normal : le titre est un lien, les actions favori / lu sont à droite.
    return (
        <li className="group flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/40">
            <Link
                to={`/novels/${novelId}/chapters/${chapter.id}`}
                className="flex min-w-0 flex-1 items-baseline gap-3"
            >
                <span className="w-10 shrink-0 tabular-nums text-muted-foreground">
                    {chapter.chapterNumber}
                </span>
                <span className={cn("truncate", isRead && "text-muted-foreground")}>
                    {chapter.title}
                </span>
            </Link>

            <div className="flex shrink-0 items-center gap-0.5">
                <RowAction
                    icon={Bookmark02Icon}
                    label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    active={isFavorite}
                    filled
                    onClick={() => onToggleFavorite(chapter.id)}
                />
                <RowAction
                    icon={CheckmarkCircle02Icon}
                    label={isRead ? "Marquer non lu" : "Marquer lu"}
                    active={isRead}
                    onClick={() => onToggleRead(chapter.id, !isRead)}
                />
            </div>
        </li>
    );
}

function RowAction({
    icon,
    label,
    active,
    filled,
    onClick,
}: {
    icon: IconSvgElement;
    label: string;
    active: boolean;
    filled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn(
                "grid size-8 place-items-center rounded-md transition-colors hover:bg-secondary",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
        >
            <Icon icon={icon} size={17} className={cn(filled && active && "fill-current")} />
        </button>
    );
}
