import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft01Icon, ArrowRight01Icon, BookOpen01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { NOVEL_STATUS } from "@/features/novels/status";
import type { Novel } from "@/features/novels/types";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Bandeau de mise en avant : romans vedettes en carrousel (boucle + auto). */
export function HeroCarousel({ novels }: { novels: Novel[] }) {
    const reduce = useReducedMotion();
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 26 },
        // Pas de défilement auto si l'utilisateur préfère réduire les animations.
        reduce ? [] : [Autoplay({ delay: 6500, stopOnInteraction: false, stopOnMouseEnter: true })],
    );
    const [selected, setSelected] = useState(0);
    const [playing, setPlaying] = useState(!reduce);

    const onSelect = useCallback(() => {
        if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        const onPlay = () => setPlaying(true);
        const onStop = () => setPlaying(false);
        emblaApi
            .on("select", onSelect)
            .on("reInit", onSelect)
            .on("autoplay:play", onPlay)
            .on("autoplay:stop", onStop);
        return () => {
            emblaApi
                .off("select", onSelect)
                .off("reInit", onSelect)
                .off("autoplay:play", onPlay)
                .off("autoplay:stop", onStop);
        };
    }, [emblaApi, onSelect]);

    function toggleAutoplay() {
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;
        if (autoplay.isPlaying()) autoplay.stop();
        else autoplay.play();
    }

    if (novels.length === 0) return null;

    return (
        <section className="relative" aria-roledescription="carrousel" aria-label="Romans à la une">
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/5" ref={emblaRef}>
                <div className="flex">
                    {novels.map((novel, i) => (
                        <div
                            key={novel.id}
                            className="min-w-0 flex-[0_0_100%]"
                            role="group"
                            aria-roledescription="diapositive"
                            aria-hidden={i !== selected}
                            inert={i !== selected ? true : undefined}
                        >
                            <HeroSlide novel={novel} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Flèches */}
            <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Roman précédent"
                className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-background/60 text-foreground ring-1 ring-white/10 backdrop-blur transition hover:bg-background sm:grid"
            >
                <Icon icon={ArrowLeft01Icon} size={20} strokeWidth={2.2} />
            </button>
            <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Roman suivant"
                className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-background/60 text-foreground ring-1 ring-white/10 backdrop-blur transition hover:bg-background sm:grid"
            >
                <Icon icon={ArrowRight01Icon} size={20} strokeWidth={2.2} />
            </button>

            {/* Points + pause/lecture */}
            <div className="absolute bottom-4 left-6 flex items-center gap-3 sm:left-10">
                <div className="flex gap-1.5">
                    {novels.map((novel, i) => (
                        <button
                            key={novel.id}
                            type="button"
                            onClick={() => emblaApi?.scrollTo(i)}
                            aria-label={`Aller au roman ${i + 1}`}
                            aria-current={i === selected}
                            className={cn(
                                "h-1.5 rounded-full transition-all",
                                i === selected ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70",
                            )}
                        />
                    ))}
                </div>
                {!reduce && (
                    <button
                        type="button"
                        onClick={toggleAutoplay}
                        aria-label={playing ? "Mettre en pause le défilement" : "Reprendre le défilement"}
                        className="grid size-7 place-items-center rounded-full bg-background/60 text-foreground ring-1 ring-white/10 backdrop-blur transition hover:bg-background"
                    >
                        {playing ? <PauseGlyph /> : <Icon icon={PlayIcon} size={13} strokeWidth={2.5} />}
                    </button>
                )}
            </div>
        </section>
    );
}

function PauseGlyph() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
    );
}

function HeroSlide({ novel }: { novel: Novel }) {
    const status = NOVEL_STATUS[novel.status];
    const cover = novel.coverImageUrl;

    return (
        <div className="relative h-90 overflow-hidden bg-card sm:h-105">
            {/* Fond flouté depuis la couverture */}
            {cover ? (
                <img
                    src={cover}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl"
                />
            ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-background to-background" />
            )}
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/20" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

            {/* Contenu */}
            <div className="relative flex h-full items-center">
                <div className="max-w-xl space-y-4 px-6 sm:px-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/25">
                            À la une
                        </span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                            {status.label}
                        </span>
                    </div>

                    <h2 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow sm:text-5xl">
                        {novel.title}
                    </h2>

                    <p className="text-sm text-white/70">par {novel.author}</p>

                    <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-white/75 sm:line-clamp-3">
                        {novel.description}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-1">
                        <Button asChild size="lg" className="rounded-full px-6 font-semibold">
                            <Link to={`/novels/${novel.id}`}>
                                <Icon icon={PlayIcon} size={18} strokeWidth={2.5} />
                                Lire
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary" className="rounded-full px-5 font-semibold">

                            <Link to={`/novels/${novel.id}`}>
                                <Icon icon={BookOpen01Icon} size={18} />
                                Détails
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Couverture nette à droite (desktop) */}
            {cover && (
                <img
                    src={cover}
                    alt={`Couverture de ${novel.title}`}
                    className="absolute right-10 top-1/2 hidden aspect-2/3 w-44 -translate-y-1/2 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 lg:block"
                />
            )}
        </div>
    );
}
