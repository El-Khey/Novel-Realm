import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

/** Onglet actif : "all" pour « Tous », sinon l'id de la catégorie. */
export type ActiveTab = "all" | number;

interface Props {
    categories: Category[];
    active: ActiveTab;
    onSelect: (tab: ActiveTab) => void;
    onCreateClick: () => void;
}

function tabClass(isActive: boolean) {
    return cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
    );
}

/** Barre d'onglets pilule : « Tous » + une étagère par onglet + bouton « + ». */
export function CategoryTabs({ categories, active, onSelect, onCreateClick }: Props) {
    return (
        <div className="flex items-center gap-2">
            <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
                <button
                    type="button"
                    className={tabClass(active === "all")}
                    aria-pressed={active === "all"}
                    onClick={() => onSelect("all")}
                >
                    Tous
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        className={tabClass(active === category.id)}
                        aria-pressed={active === category.id}
                        onClick={() => onSelect(category.id)}
                    >
                        {category.name}
                        <span
                            className={cn(
                                "rounded-full px-1.5 text-xs tabular-nums",
                                active === category.id
                                    ? "bg-white/20 text-primary-foreground"
                                    : "bg-background/60 text-muted-foreground",
                            )}
                        >
                            {category.novels.length}
                        </span>
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={onCreateClick}
                aria-label="Nouvelle étagère"
                title="Nouvelle étagère"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
                <Icon icon={PlusSignIcon} size={18} strokeWidth={2.2} />
            </button>
        </div>
    );
}
