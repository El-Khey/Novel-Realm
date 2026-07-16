import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight01Icon,
    Book02Icon,
    Bookshelf01Icon,
    Clock01Icon,
    Delete02Icon,
    GridViewIcon,
    ListViewIcon,
    PencilEdit01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { useProgressSummary } from "@/features/progress/hooks/useProgressSummary";
import { CategoryTabs, type ActiveTab } from "@/features/categories/components/CategoryTabs";
import { CreateCategoryForm } from "@/features/categories/components/CreateCategoryForm";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NovelPosterMenu } from "@/components/content/NovelPosterMenu";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/Reveal";
import AppLayout from "@/components/ui/AppLayout";
import { cn } from "@/lib/utils";
import type { Novel } from "@/features/novels/types";
import type { ReadingStatus } from "@/features/library/types";

const GRID_CLASS =
    "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

const SELECT_CLASS =
    "h-10 rounded-full border border-border bg-secondary px-4 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-ring/60";

type SortOption = "recent" | "title" | "unread";
type StatusFilter = "" | ReadingStatus;
type ViewMode = "grid" | "list";

const READING_STATUS: Record<ReadingStatus, { label: string; dot: string }> = {
    READING: { label: "En cours", dot: "bg-primary" },
    PLAN_TO_READ: { label: "À lire", dot: "bg-sky-400" },
    COMPLETED: { label: "Terminé", dot: "bg-emerald-400" },
    PAUSED: { label: "En pause", dot: "bg-amber-400" },
};

const STATUS_ORDER: ReadingStatus[] = ["READING", "PLAN_TO_READ", "COMPLETED", "PAUSED"];

/** Un élément affiché : le roman + (si dans « Tous ») son statut et sa date d'ajout. */
interface DisplayItem {
    novel: Novel;
    status?: ReadingStatus;
    addedAt?: string;
}

export default function LibraryPage() {
    const {
        entries,
        categories,
        libError,
        catError,
        libraryIds,
        toggleLibrary,
        toggleCategory,
        createCategoryWithNovel,
        create,
        rename,
        removeCategory,
    } = useLibraryManager();
    const { remainingByNovel } = useProgressSummary();

    const [active, setActive] = useState<ActiveTab>("all");
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [sort, setSort] = useState<SortOption>("recent");
    const [view, setView] = useState<ViewMode>("grid");

    // Étagères : création / renommage / suppression
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState("");
    const [shelfError, setShelfError] = useState<string | null>(null);

    const activeCategory = active === "all" ? null : categories.find((c) => c.id === active) ?? null;
    const isAll = active === "all";

    // Stats d'en-tête
    const followed = entries?.length ?? 0;
    const totalRemaining = (entries ?? []).reduce(
        (sum, e) => sum + (remainingByNovel.get(e.novel.id) ?? 0),
        0,
    );

    // Liste d'affichage : filtre (recherche + statut) puis tri.
    const items = useMemo<DisplayItem[]>(() => {
        const base: DisplayItem[] = isAll
            ? (entries ?? []).map((e) => ({ novel: e.novel, status: e.status, addedAt: e.addedAt }))
            : (activeCategory?.novels ?? []).map((n) => ({ novel: n }));

        const q = query.trim().toLowerCase();
        const filtered = base.filter((it) => {
            const matchesQuery =
                !q ||
                it.novel.title.toLowerCase().includes(q) ||
                it.novel.author.toLowerCase().includes(q);
            const matchesStatus = !isAll || !statusFilter || it.status === statusFilter;
            return matchesQuery && matchesStatus;
        });

        const byTitle = (a: DisplayItem, b: DisplayItem) =>
            a.novel.title.localeCompare(b.novel.title, "fr");
        const remaining = (it: DisplayItem) => remainingByNovel.get(it.novel.id) ?? 0;

        return [...filtered].sort((a, b) => {
            if (sort === "title") return byTitle(a, b);
            if (sort === "unread") return remaining(b) - remaining(a) || byTitle(a, b);
            // recent : par date d'ajout décroissante (à défaut, ordre alpha)
            const ta = a.addedAt ? Date.parse(a.addedAt) : 0;
            const tb = b.addedAt ? Date.parse(b.addedAt) : 0;
            return tb - ta || byTitle(a, b);
        });
    }, [isAll, entries, activeCategory, query, statusFilter, sort, remainingByNovel]);

    async function submitRename(e: React.FormEvent) {
        e.preventDefault();
        if (!activeCategory) return;
        const trimmed = draftName.trim();
        if (!trimmed || trimmed === activeCategory.name) {
            setEditing(false);
            return;
        }
        setShelfError(null);
        try {
            await rename(activeCategory.id, trimmed);
            setEditing(false);
        } catch (err) {
            setShelfError(err instanceof Error ? err.message : "Erreur inconnue");
        }
    }

    async function handleDeleteCategory() {
        if (!activeCategory) return;
        setShelfError(null);
        try {
            await removeCategory(activeCategory.id);
            setActive("all");
        } catch (err) {
            setShelfError(err instanceof Error ? err.message : "Erreur inconnue");
        }
    }

    const loading = isAll && entries === null;

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {/* En-tête + stats */}
                <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
                            Ma bibliothèque
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Vos romans suivis, rangés dans vos étagères.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <StatCard icon={Book02Icon} value={followed} label="romans suivis" />
                        <StatCard icon={Bookshelf01Icon} value={categories.length} label="étagères" />
                        <StatCard icon={Clock01Icon} value={totalRemaining} label="chapitres à lire" />
                    </div>
                </header>

                {catError && (
                    <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Impossible de charger vos étagères : {catError}
                    </p>
                )}

                {/* Onglets d'étagères + actions */}
                <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <CategoryTabs
                            categories={categories}
                            active={active}
                            onSelect={(tab) => {
                                setActive(tab);
                                setEditing(false);
                                setShelfError(null);
                            }}
                            onCreateClick={() => setCreateOpen(true)}
                        />
                    </div>
                    {activeCategory && !editing && (
                        <div className="flex shrink-0 gap-1">
                            <IconButton
                                icon={PencilEdit01Icon}
                                label="Renommer l'étagère"
                                onClick={() => {
                                    setDraftName(activeCategory.name);
                                    setEditing(true);
                                }}
                            />
                            <IconButton
                                icon={Delete02Icon}
                                label="Supprimer l'étagère"
                                danger
                                onClick={handleDeleteCategory}
                            />
                        </div>
                    )}
                </div>

                {/* Renommage inline */}
                {activeCategory && editing && (
                    <form onSubmit={submitRename} className="mt-4 flex gap-2 sm:max-w-md">
                        <Input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            maxLength={100}
                            autoFocus
                            aria-label="Nouveau nom de l'étagère"
                            className="rounded-full"
                        />
                        <Button type="submit" size="sm" className="rounded-full px-4">
                            OK
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => {
                                setEditing(false);
                                setShelfError(null);
                            }}
                        >
                            Annuler
                        </Button>
                    </form>
                )}
                {shelfError && <p className="mt-2 text-sm text-destructive">{shelfError}</p>}

                {/* Barre d'outils : recherche + statut + tri + vue */}
                <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative sm:max-w-xs sm:flex-1">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Icon icon={Search01Icon} size={18} />
                            </span>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Rechercher dans la biblio…"
                                aria-label="Rechercher dans ma bibliothèque"
                                className="h-10 w-full rounded-full border border-transparent bg-secondary pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                            />
                        </div>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            aria-label="Trier"
                            className={SELECT_CLASS}
                        >
                            <option value="recent">Récemment ajoutés</option>
                            <option value="title">Titre (A→Z)</option>
                            <option value="unread">À lire d'abord</option>
                        </select>
                    </div>

                    <ViewToggle view={view} onChange={setView} />
                </div>

                {/* Filtre par statut de lecture (uniquement dans « Tous ») */}
                {isAll && (
                    <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                        <StatusPill
                            active={statusFilter === ""}
                            onClick={() => setStatusFilter("")}
                            label="Tous les statuts"
                        />
                        {STATUS_ORDER.map((s) => (
                            <StatusPill
                                key={s}
                                active={statusFilter === s}
                                onClick={() => setStatusFilter(s)}
                                label={READING_STATUS[s].label}
                                dot={READING_STATUS[s].dot}
                            />
                        ))}
                    </div>
                )}

                {/* Contenu */}
                <div className="mt-8">
                    {isAll && libError ? (
                        <ErrorBox message={`Impossible de charger votre bibliothèque : ${libError}`} />
                    ) : loading ? (
                        <div className={GRID_CLASS}>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <PosterSkeleton key={i} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState
                            isAll={isAll}
                            filtered={query !== "" || (isAll && statusFilter !== "")}
                        />
                    ) : (
                        <Reveal>
                            <p className="mb-4 text-xs text-muted-foreground">
                                {items.length} roman{items.length > 1 ? "s" : ""}
                            </p>
                            {view === "grid" ? (
                                <div className={GRID_CLASS}>
                                    {items.map((it) => (
                                        <NovelPosterMenu
                                            key={it.novel.id}
                                            novel={it.novel}
                                            libraryIds={libraryIds}
                                            categories={categories}
                                            remaining={remainingByNovel.get(it.novel.id)}
                                            onToggleLibrary={toggleLibrary}
                                            onToggleCategory={toggleCategory}
                                            onCreateCategory={createCategoryWithNovel}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {items.map((it) => (
                                        <LibraryRow
                                            key={it.novel.id}
                                            item={it}
                                            remaining={remainingByNovel.get(it.novel.id) ?? 0}
                                        />
                                    ))}
                                </div>
                            )}
                        </Reveal>
                    )}
                </div>
            </div>

            {/* Modale de création d'étagère */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle étagère">
                <CreateCategoryForm onCreate={create} onSuccess={() => setCreateOpen(false)} />
            </Modal>
        </AppLayout>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

function StatCard({ icon, value, label }: { icon: IconSvgElement; value: number; label: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 px-4 py-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary">
                <Icon icon={icon} size={18} strokeWidth={2} />
            </span>
            <div>
                <p className="font-heading text-lg font-bold leading-none tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function IconButton({
    icon,
    label,
    onClick,
    danger,
}: {
    icon: IconSvgElement;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cn(
                "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary",
                danger ? "hover:text-destructive" : "hover:text-foreground",
            )}
        >
            <Icon icon={icon} size={18} />
        </button>
    );
}

function StatusPill({
    active,
    onClick,
    label,
    dot,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    dot?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                    ? "border-primary bg-primary/12 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
        >
            {dot && <span className={cn("size-2 rounded-full", dot)} />}
            {label}
        </button>
    );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
    return (
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary p-1">
            {(
                [
                    { mode: "grid" as const, icon: GridViewIcon, label: "Vue grille" },
                    { mode: "list" as const, icon: ListViewIcon, label: "Vue liste" },
                ]
            ).map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    type="button"
                    onClick={() => onChange(mode)}
                    aria-label={label}
                    aria-pressed={view === mode}
                    className={cn(
                        "grid size-8 place-items-center rounded-full transition-colors",
                        view === mode
                            ? "bg-background text-foreground shadow"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <Icon icon={icon} size={18} />
                </button>
            ))}
        </div>
    );
}

function LibraryRow({ item, remaining }: { item: DisplayItem; remaining: number }) {
    return (
        <Link
            to={`/novels/${item.novel.id}`}
            aria-label={[
                `${item.novel.title}, par ${item.novel.author}`,
                item.status ? READING_STATUS[item.status].label : null,
                remaining > 0 ? `${remaining} à lire` : null,
            ]
                .filter(Boolean)
                .join(" · ")}
            className="group flex items-center gap-4 rounded-xl bg-card p-3 ring-1 ring-white/5 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            <div className="w-11 shrink-0 overflow-hidden rounded-md shadow-md shadow-black/40">
                <NovelCover title={item.novel.title} coverImageUrl={item.novel.coverImageUrl} className="aspect-3/4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold text-foreground">{item.novel.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.novel.author}</p>
            </div>
            {item.status && (
                <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                    <span className={cn("size-2 rounded-full", READING_STATUS[item.status].dot)} />
                    {READING_STATUS[item.status].label}
                </span>
            )}
            {remaining > 0 && (
                <span className="hidden rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary md:inline">
                    {remaining} à lire
                </span>
            )}
            <Icon
                icon={ArrowRight01Icon}
                size={18}
                className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
        </Link>
    );
}

function EmptyState({ isAll, filtered }: { isAll: boolean; filtered: boolean }) {
    if (filtered) {
        return (
            <p className="rounded-xl border border-border/70 bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
                Aucun roman ne correspond à ces filtres.
            </p>
        );
    }
    return (
        <div className="rounded-2xl border border-border/70 bg-card/50 px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
                <Icon icon={Bookshelf01Icon} size={24} />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
                {isAll ? "Votre bibliothèque est vide." : "Cette étagère est vide."}
            </p>
            <Link
                to="/"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
                Parcourir le catalogue
                <Icon icon={ArrowRight01Icon} size={15} strokeWidth={2.5} />
            </Link>
        </div>
    );
}

function PosterSkeleton() {
    return (
        <div className="p-2">
            <div className="mb-3 aspect-2/3 w-full animate-pulse rounded-lg bg-secondary" />
            <div className="mb-1.5 h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message}
        </p>
    );
}
