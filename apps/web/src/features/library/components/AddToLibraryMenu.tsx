import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/features/categories/types";

interface Props {
    inLibrary: boolean;
    categories: Category[];
    /** Ids des catégories qui contiennent DÉJÀ ce roman. */
    novelCategoryIds: Set<number>;
    onToggleLibrary: (next: boolean) => Promise<void>;
    onToggleCategory: (categoryId: number, next: boolean) => Promise<void>;
    onCreateCategory: (name: string) => Promise<void>;
}

/**
 * Menu d'ajout posé sur une carte de roman : une case « Dans ma bibliothèque »,
 * puis une case par étagère (cochée = le roman y est), et un champ pour créer
 * une étagère à la volée. Se ferme au clic à l'extérieur.
 */
export function AddToLibraryMenu({
    inLibrary,
    categories,
    novelCategoryIds,
    onToggleLibrary,
    onToggleCategory,
    onCreateCategory,
}: Props) {
    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Fermeture au clic à l'extérieur.
    useEffect(() => {
        if (!open) return;
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    async function submitNewCategory(e: React.FormEvent) {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        setCreating(true);
        try {
            await onCreateCategory(name);
            setNewName("");
        } finally {
            setCreating(false);
        }
    }

    return (
        <div ref={ref} className="relative">
            <Button
                size="xs"
                variant={inLibrary ? "secondary" : "default"}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {inLibrary ? "✓ Dans ma biblio" : "+ Ajouter"}
            </Button>

            {open && (
                <div className="absolute right-0 top-8 z-20 w-56 rounded-lg border border-border bg-background p-1.5 shadow-xl">
                    {/* Bibliothèque */}
                    <MenuCheckbox
                        label="Dans ma bibliothèque"
                        checked={inLibrary}
                        onChange={(next) => onToggleLibrary(next)}
                    />

                    {/* Étagères */}
                    {categories.length > 0 && (
                        <>
                            <div className="my-1 border-t border-border" />
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                Étagères
                            </p>
                            <div className="max-h-48 overflow-y-auto">
                                {categories.map((category) => (
                                    <MenuCheckbox
                                        key={category.id}
                                        label={category.name}
                                        checked={novelCategoryIds.has(category.id)}
                                        onChange={(next) => onToggleCategory(category.id, next)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Création à la volée */}
                    <div className="my-1 border-t border-border" />
                    <form onSubmit={submitNewCategory} className="flex gap-1 p-1">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nouvelle étagère…"
                            maxLength={100}
                            className="h-8"
                            aria-label="Nom de la nouvelle étagère"
                        />
                        <Button type="submit" size="sm" disabled={creating || !newName.trim()}>
                            OK
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}

/** Une ligne cliquable avec case à cocher. */
function MenuCheckbox({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="size-4 accent-primary"
            />
            <span className="line-clamp-1">{label}</span>
        </label>
    );
}
