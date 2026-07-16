import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface IconProps {
    icon: IconSvgElement;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

/**
 * Icône Hugeicons standardisée : hérite de la couleur du texte (`currentColor`),
 * donc `text-primary`, `text-muted-foreground`, etc. la colorent directement.
 */
export function Icon({ icon, size = 20, strokeWidth = 1.8, className }: IconProps) {
    return (
        <HugeiconsIcon
            icon={icon}
            size={size}
            strokeWidth={strokeWidth}
            className={cn("shrink-0", className)}
        />
    );
}
