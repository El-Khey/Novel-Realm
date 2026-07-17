import { useState } from "react";
import { assetUrl } from "@/lib/http";
import { cn } from "@/lib/utils";

interface Props {
    pseudo: string;
    avatarUrl: string | null;
    /** Taille/anneaux via className (ex. `size-8`, `size-24 ring-4 ring-card`). */
    className?: string;
    /** Classe du texte des initiales (défaut `text-xs`). */
    textClassName?: string;
}

/**
 * Avatar utilisateur : photo importée si présente, sinon initiales sur dégradé
 * d'accent. Bascule automatiquement sur les initiales si l'image ne charge pas
 * (fichier supprimé, URL Google expirée…).
 */
export function UserAvatar({ pseudo, avatarUrl, className, textClassName }: Props) {
    const [broken, setBroken] = useState(false);
    const initials = pseudo.trim().slice(0, 2).toUpperCase() || "?";

    if (avatarUrl && !broken) {
        return (
            <img
                src={assetUrl(avatarUrl)}
                alt=""
                onError={() => setBroken(true)}
                className={cn("shrink-0 rounded-full object-cover", className)}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className={cn(
                "grid shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-primary-active font-bold text-primary-foreground",
                textClassName ?? "text-xs",
                className,
            )}
        >
            {initials}
        </span>
    );
}
