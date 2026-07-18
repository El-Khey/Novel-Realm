import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight01Icon,
    ArrowUpDownIcon,
    Bookshelf01Icon,
    Delete02Icon,
    Folder01Icon,
    GridViewIcon,
    ListViewIcon,
    PencilEdit01Icon,
    Search01Icon,
    SearchRemoveIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { useProgressSummary } from "@/features/progress/hooks/useProgressSummary";
import { READING_STATUS, READING_STATUS_ORDER } from "@/features/library/status";
import { ShelfRail, type ActiveShelf } from "@/features/categories/components/ShelfRail";
import { CreateCategoryForm } from "@/features/categories/components/CreateCategoryForm";
import { AddToLibraryMenu } from "@/features/library/components/AddToLibraryMenu";
import { NovelPosterMenu } from "@/components/content/NovelPosterMenu";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { SelectMenu, type SelectOption } from "@/components/ui/SelectMenu";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/Reveal";
import AppLayout from "@/components/ui/AppLayout";
import { cn } from "@/lib/utils";
import type { Novel } from "@/features/novels/types";
import type { ReadingStatus } from "@/features/library/types";

// Grille : le rail latéral occupe ~230px sur desktop, on plafonne à 5 colonnes.
const GRID_CLASS = "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";

type SortOption = "recent" | "title" | "unread";
type StatusFilter = "" | ReadingStatus;
type ViewMode = "grid" | "list";

const SORT_OPTIONS: SelectOption<SortOption>[] = [
    { value: "recent", label: "Récemment ajoutés" },
    { value: "title", label: "Titre (A→Z)" },
    { value: "unread", label: "À lire d'abord" },
];

/** Un élément affiché : le roman + son statut / sa date d'ajout en biblio. */
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
        statusByNovel,
        toggleLibrary,
        changeStatus,
        toggleCategory,
        createCategoryWithNovel,
        create,
        rename,
        removeCategory,
    } = useLibraryManager();
    const { remainingByNovel } = useProgressSummary();

    const [active, setActive] = useState<ActiveShelf>("all");
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [sort, setSort] = useState<SortOption>("recent");
    const [view, setView] = useState<ViewMode>("grid");

    // Étagères : modales de création / renommage / suppression
    const [createOpen, setCreateOpen] = useState(false);
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [draftName, setDraftName] = useState("");
    const [shelfError, setShelfError] = useState<string | null>(null);
    const [shelfPending, setShelfPending] = useState(false);

    const activeCategory = active === "all" ? null : categories.find((c) => c.id === active) ?? null;
    const isAll = active === "all";

    // Stats du hero
    const followed = entries?.length ?? 0;
    const totalRemaining = (entries ?? []).reduce(
        (sum, e) => sum + (remainingByNovel.get(e.novel.id) ?? 0),
        0,
    );

    // novelId → entrée de biblio (statut + date d'ajout), pour enrichir
    // les vues d'étagères — tout roman rangé est aussi dans la bibliothèque.
    const entryByNovel = useMemo(
        () => new Map((entries ?? []).map((e) => [e.novel.id, e] as const)),
        [entries],
    );

    // Base = onglet courant + recherche (avant filtre de statut) ; sert aussi
    // à compter les statuts pour les pilules du scope affiché.
    const { items, statusCounts } = useMemo(() => {
        const source: Novel[] = isAll
            ? (entries ?? []).map((e) => e.novel)
            : activeCategory?.novels ?? [];

        const q = query.trim().toLowerCase();
        const base: DisplayItem[] = source
            .filter(
                (n) =>
                    !q ||
                    n.title.toLowerCase().includes(q) ||
                    n.author.toLowerCase().includes(q),
            )
            .map((n) => {
                const entry = entryByNovel.get(n.id);
                return { novel: n, status: entry?.status, addedAt: entry?.addedAt };
            });

        const counts = new Map<ReadingStatus, number>();
        for (const it of base) {
            if (it.status) counts.set(it.status, (counts.get(it.status) ?? 0) + 1);
        }

        const filtered = statusFilter ? base.filter((it) => it.status === statusFilter) : base;

        const byTitle = (a: DisplayItem, b: DisplayItem) =>
            a.novel.title.localeCompare(b.novel.title, "fr");
        const remaining = (it: DisplayItem) => remainingByNovel.get(it.novel.id) ?? 0;

        const sorted = [...filtered].sort((a, b) => {
            if (sort === "title") return byTitle(a, b);
            if (sort === "unread") return remaining(b) - remaining(a) || byTitle(a, b);
            // recent : par date d'ajout décroissante (à défaut, ordre alpha)
            const ta = a.addedAt ? Date.parse(a.addedAt) : 0;
            const tb = b.addedAt ? Date.parse(b.addedAt) : 0;
            return tb - ta || byTitle(a, b);
        });

        return { items: sorted, statusCounts: counts };
    }, [isAll, entries, activeCategory, entryByNovel, query, statusFilter, sort, remainingByNovel]);

    /** Enrobe une action d'étagère : gère pending + erreur, ferme au succès. */
    async function runShelfAction(action: () => Promise<void>, onDone: () => void) {
        setShelfPending(true);
        setShelfError(null);
        try {
            await action();
            onDone();
        } catch (err) {
            setShelfError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setShelfPending(false);
        }
    }

    function submitRename(e: React.FormEvent) {
        e.preventDefault();
        if (!activeCategory) return;
        const trimmed = draftName.trim();
        if (!trimmed || trimmed === activeCategory.name) {
            setRenameOpen(false);
            return;
        }
        void runShelfAction(
            () => rename(activeCategory.id, trimmed),
            () => setRenameOpen(false),
        );
    }

    function confirmDelete() {
        if (!activeCategory) return;
        void runShelfAction(
            () => removeCategory(activeCategory.id),
            () => {
                setDeleteOpen(false);
                setActive("all");
            },
        );
    }

    function closeShelfModals() {
        setCreateOpen(false);
        setRenameOpen(false);
        setDeleteOpen(false);
        setShelfError(null);
    }

    const loading = entries === null;
    const hasFilters = query !== "" || statusFilter !== "";
    const viewTitle = activeCategory?.name ?? "Tous les romans";

    return (
        <AppLayout>
            {/* ── HERO ─────────────────────────────────────────────────── */}
            <header className="relative overflow-hidden border-b border-border/60">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -right-24 -top-32 size-96 rounded-full bg-primary/15 blur-3xl" />
                    <div className="absolute -left-24 top-8 size-72 rounded-full bg-primary/8 blur-3xl" />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
                </div>

                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
                    <Reveal>
                        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    <Icon icon={Bookshelf01Icon} size={14} strokeWidth={2.2} />
                                    Ma collection
                                </span>
                                <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
                                    Ma{" "}
                                    <span className="bg-linear-to-r from-primary to-primary-active bg-clip-text text-transparent">
                                        bibliothèque
                                    </span>
                                </h1>
                                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                                    Vos romans suivis, rangés dans vos étagères — reprenez
                                    votre lecture là où vous l'avez laissée.
                                </p>
                            </div>

                            <dl className="flex divide-x divide-border/60">
                                <HeroStat value={followed} label="Romans suivis" first />
                                <HeroStat value={categories.length} label="Étagères" />
                                <HeroStat value={totalRemaining} label="Chapitres à lire" />
                            </dl>
                        </div>
                    </Reveal>
                </div>
            </header>

            {/* ── CORPS : rail d'étagères + contenu ────────────────────── */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
                <ShelfRail
                    categories={categories}
                    active={active}
                    totalCount={followed}
                    onSelect={(shelf) => {
                        setActive(shelf);
                        setShelfError(null);
                    }}
                    onCreateClick={() => setCreateOpen(true)}
                />

                <div className="mt-6 min-w-0 lg:mt-0">
                    {catError && (
                        <ErrorBox message={`Impossible de charger vos étagères : ${catError}`} className="mb-4" />
                    )}

                    {/* En-tête contextuel : vue courante + actions d'étagère */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-baseline gap-2.5">
                            <h2 className="font-heading text-xl font-bold tracking-tight">
                                {viewTitle}
                            </h2>
                            {!loading && (
                                <span className="text-sm tabular-nums text-muted-foreground">
                                    {items.length} roman{items.length > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                        {activeCategory && (
                            <div className="flex gap-2">
                                <ShelfAction
                                    icon={PencilEdit01Icon}
                                    label="Renommer"
                                    onClick={() => {
                                        setDraftName(activeCategory.name);
                                        setShelfError(null);
                                        setRenameOpen(true);
                                    }}
                                />
                                <ShelfAction
                                    icon={Delete02Icon}
                                    label="Supprimer"
                                    danger
                                    onClick={() => {
                                        setShelfError(null);
                                        setDeleteOpen(true);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Barre d'outils : recherche + tri + vue */}
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-2">
                        <div className="relative min-w-0 flex-1">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Icon icon={Search01Icon} size={17} />
                            </span>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Rechercher un titre, un auteur…"
                                aria-label="Rechercher dans ma bibliothèque"
                                className="h-10 w-full rounded-xl border border-transparent bg-secondary pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                            />
                        </div>
                        <SelectMenu
                            value={sort}
                            options={SORT_OPTIONS}
                            onChange={setSort}
                            label="Trier"
                            icon={ArrowUpDownIcon}
                            compactLabel
                        />
                        <ViewToggle view={view} onChange={setView} />
                    </div>

                    {/* Filtre par statut de lecture, avec compteurs du scope courant */}
                    <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                        <StatusPill
                            active={statusFilter === ""}
                            onClick={() => setStatusFilter("")}
                            label="Tous les statuts"
                        />
                        {READING_STATUS_ORDER.map((s) => (
                            <StatusPill
                                key={s}
                                active={statusFilter === s}
                                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                                label={READING_STATUS[s].label}
                                dot={READING_STATUS[s].dot}
                                count={statusCounts.get(s) ?? 0}
                            />
                        ))}
                    </div>

                    {/* Contenu */}
                    <div className="mt-6">
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
                                filtered={hasFilters}
                                onReset={() => {
                                    setQuery("");
                                    setStatusFilter("");
                                }}
                            />
                        ) : view === "grid" ? (
                            <Reveal>
                                <div className={GRID_CLASS}>
                                    {items.map((it) => (
                                        <NovelPosterMenu
                                            key={it.novel.id}
                                            novel={it.novel}
                                            libraryIds={libraryIds}
                                            categories={categories}
                                            remaining={remainingByNovel.get(it.novel.id)}
                                            status={statusByNovel.get(it.novel.id)}
                                            onToggleLibrary={toggleLibrary}
                                            onToggleCategory={toggleCategory}
                                            onCreateCategory={createCategoryWithNovel}
                                            onChangeStatus={async (novelId, s) => {
                                                await changeStatus(novelId, s);
                                            }}
                                        />
                                    ))}
                                </div>
                            </Reveal>
                        ) : (
                            <Reveal>
                                <div className="flex flex-col gap-2">
                                    {items.map((it) => (
                                        <LibraryRow
                                            key={it.novel.id}
                                            item={it}
                                            remaining={remainingByNovel.get(it.novel.id)}
                                            menu={
                                                <AddToLibraryMenu
                                                    inLibrary={libraryIds.has(it.novel.id)}
                                                    categories={categories}
                                                    novelCategoryIds={
                                                        new Set(
                                                            categories
                                                                .filter((c) =>
                                                                    c.novels.some((n) => n.id === it.novel.id),
                                                                )
                                                                .map((c) => c.id),
                                                        )
                                                    }
                                                    status={statusByNovel.get(it.novel.id)}
                                                    onToggleLibrary={(next) => toggleLibrary(it.novel.id, next)}
                                                    onToggleCategory={(catId, next) =>
                                                        toggleCategory(it.novel.id, catId, next)
                                                    }
                                                    onCreateCategory={(name) =>
                                                        createCategoryWithNovel(it.novel.id, name)
                                                    }
                                                    onChangeStatus={async (s) => {
                                                        await changeStatus(it.novel.id, s);
                                                    }}
                                                />
                                            }
                                        />
                                    ))}
                                </div>
                            </Reveal>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modales d'étagères ───────────────────────────────────── */}
            <Modal
                open={createOpen}
                onClose={closeShelfModals}
                title="Nouvelle étagère"
                description="Organisez votre bibliothèque en collections personnalisées."
            >
                <CreateCategoryForm
                    onCreate={create}
                    onSuccess={closeShelfModals}
                    onCancel={closeShelfModals}
                />
            </Modal>

            <Modal
                open={renameOpen}
                onClose={closeShelfModals}
                title="Renommer l'étagère"
                description={activeCategory ? `« ${activeCategory.name} »` : undefined}
            >
                <form onSubmit={submitRename} className="flex flex-col gap-4">
                    <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        maxLength={100}
                        autoFocus
                        aria-label="Nouveau nom de l'étagère"
                        className="h-11 w-full rounded-xl border border-transparent bg-secondary px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                    />
                    {shelfError && <p className="text-sm text-destructive">{shelfError}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" className="rounded-full" onClick={closeShelfModals}>
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={shelfPending || !draftName.trim()}
                            className="rounded-full px-5"
                        >
                            {shelfPending ? "Renommage…" : "Renommer"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={deleteOpen}
                onClose={closeShelfModals}
                title="Supprimer l'étagère"
                description={activeCategory ? `« ${activeCategory.name} »` : undefined}
            >
                <p className="text-sm leading-relaxed text-muted-foreground">
                    L'étagère sera supprimée définitivement. Les romans qu'elle contient
                    resteront dans votre bibliothèque.
                </p>
                {shelfError && <p className="mt-3 text-sm text-destructive">{shelfError}</p>}
                <div className="mt-5 flex justify-end gap-2">
                    <Button type="button" variant="ghost" className="rounded-full" onClick={closeShelfModals}>
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={shelfPending}
                        className="rounded-full px-5"
                        onClick={confirmDelete}
                    >
                        {shelfPending ? "Suppression…" : "Supprimer"}
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

function HeroStat({ value, label, first }: { value: number; label: string; first?: boolean }) {
    return (
        <div className={cn("px-6", first && "pl-0")}>
            <dd className="font-heading text-4xl font-extrabold leading-none tabular-nums">
                {value.toLocaleString("fr-FR")}
            </dd>
            <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </dt>
        </div>
    );
}

function ShelfAction({
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
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors",
                danger
                    ? "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    : "hover:bg-secondary hover:text-foreground",
            )}
        >
            <Icon icon={icon} size={14} />
            {label}
        </button>
    );
}

function StatusPill({
    active,
    onClick,
    label,
    dot,
    count,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    dot?: string;
    count?: number;
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
            {count != null && (
                <span
                    className={cn(
                        "tabular-nums text-xs",
                        active ? "text-primary" : "text-muted-foreground/70",
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
    return (
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-secondary p-1">
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
                        "grid size-8 place-items-center rounded-lg transition-colors",
                        view === mode
                            ? "bg-background text-foreground shadow"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <Icon icon={icon} size={17} />
                </button>
            ))}
        </div>
    );
}

/**
 * Ligne de la vue liste : couverture + identité + statut + progression +
 * date d'ajout + menu de rangement. Le lien couvre toute la ligne ; seuls le
 * menu (et le popover) restent interactifs par-dessus.
 */
function LibraryRow({
    item,
    remaining,
    menu,
}: {
    item: DisplayItem;
    remaining?: number;
    menu: React.ReactNode;
}) {
    const addedLabel = item.addedAt
        ? new Date(item.addedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <div className="group relative flex items-center gap-4 rounded-xl bg-card p-3 pr-4 ring-1 ring-white/5 transition-colors hover:bg-surface-2">
            <Link
                to={`/novels/${item.novel.id}`}
                aria-label={[
                    `${item.novel.title}, par ${item.novel.author}`,
                    item.status ? READING_STATUS[item.status].label : null,
                    remaining != null && remaining > 0 ? `${remaining} à lire` : null,
                ]
                    .filter(Boolean)
                    .join(" · ")}
                className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />

            {/* Contenu principal (le clic traverse jusqu'au lien) */}
            <div className="pointer-events-none relative flex min-w-0 flex-1 items-center gap-4">
                <div className="w-11 shrink-0 overflow-hidden rounded-md shadow-md shadow-black/40">
                    <NovelCover
                        title={item.novel.title}
                        coverImageUrl={item.novel.coverImageUrl}
                        className="aspect-3/4"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold text-foreground">{item.novel.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{item.novel.author}</p>
                </div>
            </div>

            {/* Badges + menu */}
            <div className="relative z-10 flex shrink-0 items-center gap-2">
                {addedLabel && (
                    <span className="pointer-events-none hidden text-xs text-muted-foreground/70 xl:block">
                        Ajouté le {addedLabel}
                    </span>
                )}
                {item.status && (
                    <span className="pointer-events-none hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                        <span className={cn("size-2 rounded-full", READING_STATUS[item.status].dot)} />
                        {READING_STATUS[item.status].label}
                    </span>
                )}
                {remaining != null && remaining > 0 ? (
                    <span className="pointer-events-none hidden rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary md:inline">
                        {remaining} à lire
                    </span>
                ) : remaining === 0 ? (
                    <span className="pointer-events-none hidden rounded-full bg-up/12 px-2.5 py-1 text-xs font-semibold text-up md:inline">
                        À jour
                    </span>
                ) : null}
                <div className="pointer-events-auto">{menu}</div>
            </div>
        </div>
    );
}

function EmptyState({
    isAll,
    filtered,
    onReset,
}: {
    isAll: boolean;
    filtered: boolean;
    onReset: () => void;
}) {
    if (filtered) {
        return (
            <div className="rounded-2xl border border-border/70 bg-card/50 px-6 py-14 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                    <Icon icon={SearchRemoveIcon} size={22} />
                </span>
                <p className="mt-4 text-sm text-muted-foreground">
                    Aucun roman ne correspond à ces filtres.
                </p>
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                    Réinitialiser les filtres
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border/70 bg-card/50 px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Icon icon={isAll ? Bookshelf01Icon : Folder01Icon} size={26} />
            </span>
            <p className="mt-5 font-heading text-lg font-bold">
                {isAll ? "Votre bibliothèque est vide" : "Cette étagère est vide"}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {isAll
                    ? "Suivez des romans pour les retrouver ici et suivre votre progression."
                    : "Rangez-y des romans via le cœur en coin de carte, section « Étagères »."}
            </p>
            {isAll && (
                <Link
                    to="/explorer"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary-active"
                >
                    Parcourir le catalogue
                    <Icon icon={ArrowRight01Icon} size={15} strokeWidth={2.5} />
                </Link>
            )}
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

function ErrorBox({ message, className }: { message: string; className?: string }) {
    return (
        <p
            className={cn(
                "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
                className,
            )}
        >
            {message}
        </p>
    );
}
