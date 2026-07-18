import { useEffect, useRef, useState } from "react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string> {
    value: T;
    label: string;
    /** Classe de pastille colorée optionnelle (ex. "bg-emerald-400"). */
    dot?: string;
}

interface Props<T extends string> {
    value: T;
    options: SelectOption<T>[];
    onChange: (value: T) => void;
    /** Libellé accessible du déclencheur. */
    label: string;
    /** Icône affichée à gauche de la valeur courante. */
    icon?: IconSvgElement;
    /** Masque le libellé en dessous de `sm` (gain de place en barre d'outils). */
    compactLabel?: boolean;
    /** Alignement du panneau par rapport au déclencheur. */
    align?: "start" | "end";
    className?: string;
}

/**
 * Menu de sélection maison — remplaçant du `<select>` natif, dont le rendu est
 * imposé par l'OS et jure avec le thème sombre. Déclencheur en pilule + panneau
 * animé, une ligne par option et un ✓ sur la valeur courante.
 *
 * <p>Partagé par la Bibliothèque et l'Explorer pour que tous les filtres/tris
 * de l'app aient exactement la même apparence.
 */
export function SelectMenu<T extends string>({
    value,
    options,
    onChange,
    label,
    icon,
    compactLabel,
    align = "end",
    className,
}: Props<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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

    const current = options.find((o) => o.value === value) ?? options[0];

    return (
        <div ref={ref} className={cn("relative shrink-0", className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={label}
                className="inline-flex h-10 max-w-52 items-center gap-2 rounded-xl bg-secondary px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
                {icon && <Icon icon={icon} size={15} className="shrink-0 text-muted-foreground" />}
                {current?.dot && (
                    <span className={cn("size-1.5 shrink-0 rounded-full", current.dot)} />
                )}
                <span className={cn("truncate", compactLabel && "hidden sm:block")}>
                    {current?.label}
                </span>
                <Icon
                    icon={ArrowDown01Icon}
                    size={15}
                    className={cn(
                        "shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        role="menu"
                        className={cn(
                            "absolute top-12 z-40 max-h-80 w-56 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/50",
                            align === "end" ? "right-0" : "left-0",
                        )}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                role="menuitemradio"
                                aria-checked={option.value === value}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                                    option.value === value
                                        ? "font-semibold text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {option.dot && (
                                    <span className={cn("size-1.5 shrink-0 rounded-full", option.dot)} />
                                )}
                                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                {option.value === value && (
                                    <Icon
                                        icon={Tick02Icon}
                                        size={15}
                                        strokeWidth={2.5}
                                        className="shrink-0 text-primary"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
