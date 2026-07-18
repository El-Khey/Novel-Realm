import { useState } from "react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const VALUES = [1, 2, 3, 4, 5] as const;

/**
 * Affichage d'une note en étoiles (lecture seule). La note fractionnaire est
 * rendue fidèlement : la dernière étoile est remplie partiellement par
 * superposition d'un calque découpé, plutôt qu'arrondie.
 */
export function StarRating({
    value,
    size = 16,
    className,
}: {
    value: number;
    size?: number;
    className?: string;
}) {
    return (
        <div
            className={cn("inline-flex items-center gap-0.5", className)}
            role="img"
            aria-label={`${value.toFixed(1)} sur 5`}
        >
            {VALUES.map((star) => {
                // Part de CETTE étoile qui doit être remplie (0 → 1).
                const fill = Math.max(0, Math.min(1, value - (star - 1)));
                return (
                    <span key={star} className="relative inline-block shrink-0">
                        <Icon icon={StarIcon} size={size} className="text-muted-foreground/35" />
                        {fill > 0 && (
                            <span
                                className="absolute inset-y-0 left-0 overflow-hidden"
                                style={{ width: `${fill * 100}%` }}
                                aria-hidden
                            >
                                <Icon icon={StarIcon} size={size} className="fill-current text-gold" />
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

/**
 * Saisie d'une note en étoiles. Survol et focus clavier prévisualisent la note,
 * le clic la valide. Implémenté en `radiogroup` pour rester utilisable au
 * clavier et annoncé correctement par les lecteurs d'écran.
 */
export function StarInput({
    value,
    onChange,
    size = 28,
    disabled,
}: {
    value: number;
    onChange: (value: number) => void;
    size?: number;
    disabled?: boolean;
}) {
    const [preview, setPreview] = useState<number | null>(null);
    const shown = preview ?? value;

    return (
        <div
            role="radiogroup"
            aria-label="Votre note"
            className="inline-flex items-center gap-1"
            onMouseLeave={() => setPreview(null)}
        >
            {VALUES.map((star) => (
                <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={value === star}
                    aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                    disabled={disabled}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setPreview(star)}
                    onFocus={() => setPreview(star)}
                    onBlur={() => setPreview(null)}
                    className={cn(
                        "rounded-md p-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        !disabled && "hover:scale-110",
                        disabled && "cursor-not-allowed opacity-60",
                    )}
                >
                    <Icon
                        icon={StarIcon}
                        size={size}
                        className={cn(
                            "transition-colors",
                            star <= shown
                                ? "fill-current text-gold"
                                : "text-muted-foreground/40",
                        )}
                    />
                </button>
            ))}
        </div>
    );
}
