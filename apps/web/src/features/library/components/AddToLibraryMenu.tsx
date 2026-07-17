import { useEffect, useRef, useState } from "react";
import {
    Delete02Icon,
    FavouriteIcon,
    Folder01Icon,
    PlusSignIcon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { READING_STATUS, READING_STATUS_ORDER } from "@/features/library/status";
import type { ReadingStatus } from "@/features/library/types";
import type { Category } from "@/features/categories/types";

interface Props {
    inLibrary: boolean;
    categories: Category[];
    /** Ids des catégories qui contiennent DÉJÀ ce roman. */
    novelCategoryIds: Set<number>;
    /** Statut de lecture actuel (si le roman est en bibliothèque). */
    status?: ReadingStatus;
    onToggleLibrary: (next: boolean) => Promise<void>;
    onToggleCategory: (categoryId: number, next: boolean) => Promise<void>;
    onCreateCategory: (name: string) => Promise<void>;
    /** Change le statut de lecture (optionnel : masque la section si absent). */
    onChangeStatus?: (status: ReadingStatus) => Promise<void>;
}

/**
 * Panneau de rangement d'un roman, posé en coin de carte : ajout/retrait de la
 * bibliothèque, statut de lecture, étagères (cocher = ranger) et création
 * d'étagère à la volée. Un seul composant partagé par l'Accueil, l'Explorer et
 * la Bibliothèque — le rangement se fait partout de la même façon.
 */
export function AddToLibraryMenu({
    inLibrary,
    categories,
    novelCategoryIds,
    status,
    onToggleLibrary,
    onToggleCategory,
    onCreateCategory,
    onChangeStatus,
}: Props) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const createInputRef = useRef<HTMLInputElement>(null);

    // Fermeture au clic à l'extérieur / Échap.
    useEffect(() => {
        if (!open) return;
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    // Le champ de création se replie quand on ferme le panneau.
    useEffect(() => {
        if (!open) {
            setCreating(false);
            setNewName("");
        }
    }, [open]);

    /** Enrobe une mutation : verrouille le panneau le temps de l'appel. */
    async function run(action: () => Promise<unknown>) {
        setPending(true);
        try {
            await action();
        } finally {
            setPending(false);
        }
    }

    async function submitNewCategory(e: React.FormEvent) {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        await run(() => onCreateCategory(name));
        setNewName("");
        setCreating(false);
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={
                    inLibrary ? "Dans ma bibliothèque — gérer" : "Ajouter à ma bibliothèque"
                }
                title={inLibrary ? "Dans ma bibliothèque" : "Ajouter à ma bibliothèque"}
                className="grid size-8 place-items-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <Icon
                    icon={FavouriteIcon}
                    size={16}
                    strokeWidth={2}
                    className={cn("transition-colors", inLibrary && "fill-current text-primary")}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "absolute right-0 top-10 z-30 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl shadow-black/50",
                            pending && "pointer-events-none opacity-70",
                        )}
                        role="menu"
                    >
                        {/* ── Bibliothèque : ajouter / état ─────────────────── */}
                        {!inLibrary ? (
                            <button
                                type="button"
                                onClick={() => run(() => onToggleLibrary(true))}
                                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                            >
                                <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-primary">
                                    <Icon icon={FavouriteIcon} size={15} strokeWidth={2.2} />
                                </span>
                                Ajouter à ma bibliothèque
                            </button>
                        ) : (
                            <div className="flex items-center gap-2.5 px-3.5 py-3">
                                <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-primary">
                                    <Icon icon={Tick02Icon} size={15} strokeWidth={2.5} />
                                </span>
                                <p className="text-sm font-semibold">Dans ma bibliothèque</p>
                            </div>
                        )}

                        {/* ── Statut de lecture ─────────────────────────────── */}
                        {inLibrary && status && onChangeStatus && (
                            <div className="border-t border-border px-2.5 py-2.5">
                                <SectionLabel>Statut de lecture</SectionLabel>
                                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                                    {READING_STATUS_ORDER.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => s !== status && run(() => onChangeStatus(s))}
                                            aria-pressed={s === status}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                                                s === status
                                                    ? "border-primary/60 bg-primary/12 text-foreground"
                                                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
                                            )}
                                        >
                                            <span className={cn("size-1.5 rounded-full", READING_STATUS[s].dot)} />
                                            {READING_STATUS[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Étagères ──────────────────────────────────────── */}
                        <div className="border-t border-border px-2.5 py-2.5">
                            <SectionLabel>Étagères</SectionLabel>
                            {categories.length > 0 && (
                                <div className="mt-1 max-h-44 overflow-y-auto">
                                    {categories.map((category) => {
                                        const checked = novelCategoryIds.has(category.id);
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() =>
                                                    run(() => onToggleCategory(category.id, !checked))
                                                }
                                                aria-pressed={checked}
                                                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
                                            >
                                                <Icon
                                                    icon={Folder01Icon}
                                                    size={15}
                                                    className={cn(
                                                        checked ? "text-primary" : "text-muted-foreground",
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        "min-w-0 flex-1 truncate text-left",
                                                        checked ? "text-foreground" : "text-muted-foreground",
                                                    )}
                                                >
                                                    {category.name}
                                                </span>
                                                {checked && (
                                                    <Icon
                                                        icon={Tick02Icon}
                                                        size={15}
                                                        strokeWidth={2.5}
                                                        className="shrink-0 text-primary"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Création à la volée : un bouton qui se déplie en champ. */}
                            {creating ? (
                                <form onSubmit={submitNewCategory} className="mt-1 flex gap-1.5 p-0.5">
                                    <input
                                        ref={createInputRef}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Nom de l'étagère…"
                                        maxLength={100}
                                        autoFocus
                                        aria-label="Nom de la nouvelle étagère"
                                        className="h-8 min-w-0 flex-1 rounded-lg border border-transparent bg-secondary px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring/60"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newName.trim()}
                                        aria-label="Créer l'étagère"
                                        className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-active disabled:opacity-40"
                                    >
                                        <Icon icon={Tick02Icon} size={15} strokeWidth={2.5} />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setCreating(true)}
                                    className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                >
                                    <Icon icon={PlusSignIcon} size={15} strokeWidth={2.2} />
                                    Nouvelle étagère
                                </button>
                            )}
                        </div>

                        {/* ── Retrait ───────────────────────────────────────── */}
                        {inLibrary && (
                            <div className="border-t border-border p-1.5">
                                <button
                                    type="button"
                                    onClick={() => run(() => onToggleLibrary(false))}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Icon icon={Delete02Icon} size={15} />
                                    Retirer de la bibliothèque
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {children}
        </p>
    );
}
