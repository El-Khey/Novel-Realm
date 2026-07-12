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
        "shrink-0 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
        isActive
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
    );
}

/** Barre d'onglets : « Tous » + une catégorie par onglet + bouton « + ». */
export function CategoryTabs({ categories, active, onSelect, onCreateClick }: Props) {
    return (
        <div className="flex items-center gap-6 border-b border-border">
            <div className="flex flex-1 items-center gap-6 overflow-x-auto">
                <button type="button" className={tabClass(active === "all")} onClick={() => onSelect("all")}>
                    Tous
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        className={tabClass(active === category.id)}
                        onClick={() => onSelect(category.id)}
                    >
                        {category.name}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                            {category.novels.length}
                        </span>
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={onCreateClick}
                aria-label="Nouvelle étagère"
                className="mb-1 grid size-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
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
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                </svg>
            </button>
        </div>
    );
}
