import { useState } from "react";
import { Link } from "react-router-dom";
import { useLibraryManager } from "@/features/library/hooks/useLibraryManager";
import { CategoryTabs, type ActiveTab } from "@/features/categories/components/CategoryTabs";
import { CreateCategoryForm } from "@/features/categories/components/CreateCategoryForm";
import { NovelWithMenu } from "@/features/library/components/NovelWithMenu";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/ui/AppLayout";
import type { Novel } from "@/features/novels/types";

const GRID = "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4";

export default function LibraryPage() {
    const manager = useLibraryManager();
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
    } = manager;

    const [active, setActive] = useState<ActiveTab>("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState("");
    const [renameError, setRenameError] = useState<string | null>(null);

    const activeCategory = active === "all" ? null : categories.find((c) => c.id === active) ?? null;

    async function submitRename(e: React.FormEvent) {
        e.preventDefault();
        if (!activeCategory) return;
        const trimmed = draftName.trim();
        if (!trimmed || trimmed === activeCategory.name) {
            setEditing(false);
            return;
        }
        setRenameError(null);
        try {
            await rename(activeCategory.id, trimmed);
            setEditing(false);
        } catch (err) {
            setRenameError(err instanceof Error ? err.message : "Erreur inconnue");
        }
    }

    async function handleDeleteCategory() {
        if (!activeCategory) return;
        await removeCategory(activeCategory.id);
        setActive("all"); // l'onglet actif vient de disparaître
    }

    /** Grille de cartes avec menu (biblio + étagères) — commune aux deux onglets. */
    function grid(novels: Novel[]) {
        return (
            <div className={GRID}>
                {novels.map((novel) => (
                    <NovelWithMenu
                        key={novel.id}
                        novel={novel}
                        libraryIds={libraryIds}
                        categories={categories}
                        onToggleLibrary={toggleLibrary}
                        onToggleCategory={toggleCategory}
                        onCreateCategory={createCategoryWithNovel}
                    />
                ))}
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Ma bibliothèque</h1>
                </header>

                {catError && (
                    <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Impossible de charger vos étagères : {catError}
                    </p>
                )}

                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <CategoryTabs
                            categories={categories}
                            active={active}
                            onSelect={(tab) => {
                                setActive(tab);
                                setEditing(false);
                                setRenameError(null);
                            }}
                            onCreateClick={() => setCreateOpen(true)}
                        />
                    </div>

                    {/* Actions de l'étagère active : icônes discrètes */}
                    {activeCategory && !editing && (
                        <div className="mb-1 flex shrink-0 gap-0.5">
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Renommer l'étagère"
                                title="Renommer"
                                onClick={() => {
                                    setDraftName(activeCategory.name);
                                    setEditing(true);
                                }}
                            >
                                <PencilIcon />
                            </Button>
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Supprimer l'étagère"
                                title="Supprimer"
                                onClick={handleDeleteCategory}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <TrashIcon />
                            </Button>
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
                        />
                        <Button type="submit" size="sm">
                            OK
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setEditing(false);
                                setRenameError(null);
                            }}
                        >
                            Annuler
                        </Button>
                    </form>
                )}
                {renameError && <p className="mt-2 text-sm text-destructive">{renameError}</p>}

                {/* Contenu de l'onglet actif */}
                <div className="mt-8">
                    {active === "all" ? (
                        libError ? (
                            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                Impossible de charger votre bibliothèque : {libError}
                            </p>
                        ) : entries === null ? (
                            <LibrarySkeleton />
                        ) : entries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Votre bibliothèque est vide.{" "}
                                <Link to="/" className="text-primary underline-offset-4 hover:underline">
                                    Parcourez le catalogue
                                </Link>{" "}
                                pour y ajouter des romans.
                            </p>
                        ) : (
                            grid(entries.map((e) => e.novel))
                        )
                    ) : activeCategory ? (
                        activeCategory.novels.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Cette étagère est vide. Ajoutez-y des romans via le menu «&nbsp;+&nbsp;» d'une carte.
                            </p>
                        ) : (
                            grid(activeCategory.novels)
                        )
                    ) : null}
                </div>
            </div>

            {/* Modale de création d'étagère */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle étagère">
                <CreateCategoryForm onCreate={create} onSuccess={() => setCreateOpen(false)} />
            </Modal>
        </AppLayout>
    );
}

function PencilIcon() {
    return (
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}

function TrashIcon() {
    return (
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
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
    );
}

function LibrarySkeleton() {
    return (
        <div className={GRID}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="aspect-3/4 w-full animate-pulse rounded-xl bg-secondary" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                </div>
            ))}
        </div>
    );
}
