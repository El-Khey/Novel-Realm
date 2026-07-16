import { Link } from "react-router-dom";
import type { IconSvgElement } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Action =
    | { label: string; to: string; onClick?: never }
    | { label: string; onClick: () => void; to?: never };

interface Props {
    title: string;
    /** Petite icône dans une pastille à gauche du titre. */
    icon?: IconSvgElement;
    /** Lien / bouton « Voir tout » aligné à droite. */
    action?: Action;
    className?: string;
}

const ACTION_CLASS =
    "group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground";

/** En-tête de section : pastille d'icône + titre display + action « Voir tout ». */
export function SectionHeader({ title, icon, action, className }: Props) {
    return (
        <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
            <h2 className="flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {icon && (
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/12 text-primary">
                        <Icon icon={icon} size={18} strokeWidth={2} />
                    </span>
                )}
                {title}
            </h2>

            {action &&
                (action.to ? (
                    <Link to={action.to} className={ACTION_CLASS}>
                        {action.label}
                        <Icon
                            icon={ArrowRight01Icon}
                            size={14}
                            strokeWidth={2.5}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                ) : (
                    <button type="button" onClick={action.onClick} className={ACTION_CLASS}>
                        {action.label}
                        <Icon
                            icon={ArrowRight01Icon}
                            size={14}
                            strokeWidth={2.5}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </button>
                ))}
        </div>
    );
}
