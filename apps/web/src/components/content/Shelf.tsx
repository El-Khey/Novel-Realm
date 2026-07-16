import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface ShelfProps {
    /** Les cartes à faire défiler (une par « slide »). */
    items: ReactNode[];
    /** Largeur (flex-basis) de chaque carte — responsive via classes Tailwind. */
    itemClassName?: string;
    className?: string;
}

// Par défaut : ~2,3 cartes visibles en mobile → ~6,5 en très large.
const DEFAULT_ITEM =
    "flex-[0_0_44%] sm:flex-[0_0_30%] md:flex-[0_0_23%] lg:flex-[0_0_18.5%] xl:flex-[0_0_15.5%]";

/**
 * Étagère horizontale façon Spotify : défilement fluide (drag + molette),
 * flèches au survol, et dégradés de bord pour signaler qu'il reste du contenu.
 */
export function Shelf({ items, itemClassName = DEFAULT_ITEM, className }: ShelfProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        dragFree: true,
        containScroll: "trimSnaps",
    });
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    // Indices actuellement visibles (null tant qu'Embla n'a pas mesuré).
    const [inView, setInView] = useState<number[] | null>(null);

    // Boutons : booléens → setState « bail out » si inchangé (pas de re-render inutile).
    const refreshButtons = useCallback(() => {
        if (!emblaApi) return;
        setCanPrev(emblaApi.canScrollPrev());
        setCanNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    // Visibilité : mise à jour seulement quand l'ensemble change (event dédié).
    const refreshInView = useCallback(() => {
        if (emblaApi) setInView(emblaApi.slidesInView());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        refreshButtons();
        refreshInView();
        emblaApi
            .on("select", refreshButtons)
            .on("scroll", refreshButtons)
            .on("reInit", refreshButtons)
            .on("slidesInView", refreshInView)
            .on("reInit", refreshInView);
        return () => {
            emblaApi
                .off("select", refreshButtons)
                .off("scroll", refreshButtons)
                .off("reInit", refreshButtons)
                .off("slidesInView", refreshInView)
                .off("reInit", refreshInView);
        };
    }, [emblaApi, refreshButtons, refreshInView]);

    return (
        <div className={cn("group/shelf relative", className)}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3 sm:gap-4">
                    {items.map((item, i) => {
                        const hidden = inView !== null && !inView.includes(i);
                        return (
                            <div
                                key={i}
                                className={cn("min-w-0", itemClassName)}
                                aria-hidden={hidden ? true : undefined}
                                inert={hidden ? true : undefined}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dégradés de bord (n'interceptent pas les clics) */}
            <div
                className={cn(
                    "pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent transition-opacity",
                    canPrev ? "opacity-100" : "opacity-0",
                )}
            />
            <div
                className={cn(
                    "pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent transition-opacity",
                    canNext ? "opacity-100" : "opacity-0",
                )}
            />

            {/* Flèches — visibles au survol de l'étagère, sur la zone des couvertures */}
            {canPrev && (
                <ShelfArrow direction="left" onClick={() => emblaApi?.scrollPrev()} />
            )}
            {canNext && (
                <ShelfArrow direction="right" onClick={() => emblaApi?.scrollNext()} />
            )}
        </div>
    );
}

function ShelfArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={direction === "left" ? "Précédent" : "Suivant"}
            className={cn(
                "absolute top-[34%] z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full",
                "bg-background/80 text-foreground opacity-0 shadow-xl shadow-black/50 ring-1 ring-white/10 backdrop-blur",
                // Invisible au repos → ne capte pas les taps (mobile) ; réactivé au survol / focus clavier.
                "pointer-events-none transition-all hover:scale-105 hover:bg-background focus-visible:opacity-100 group-hover/shelf:pointer-events-auto group-hover/shelf:opacity-100",
                direction === "left" ? "left-1" : "right-1",
            )}
        >
            <Icon
                icon={direction === "left" ? ArrowLeft01Icon : ArrowRight01Icon}
                size={20}
                strokeWidth={2.2}
            />
        </button>
    );
}
