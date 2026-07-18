import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { LeftToRightListBulletIcon, StarIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { getNovel } from "@/features/novels/novel.service";
import type { NovelDetail } from "@/features/novels/types";
import { NovelHero } from "@/features/novels/components/NovelHero";
import { ChapterList } from "@/features/novels/components/ChapterList";
import { useChapters } from "@/features/novels/hooks/useChapters";
import { useNovelProgress } from "@/features/progress/hooks/useNovelProgress";
import { useChapterFavorites } from "@/features/favorites/hooks/useChapterFavorites";
import { ReviewSection } from "@/features/reviews/components/ReviewSection";
import { ApiError } from "@/lib/http";
import { Icon } from "@/components/ui/icon";
import AppLayout from "@/components/ui/AppLayout";
import { cn } from "@/lib/utils";

/** Onglet affiché sous l'en-tête de la fiche. */
type NovelTab = "chapitres" | "avis";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; novel: NovelDetail };

export default function NovelDetailPage() {
    const { id } = useParams();
    const novelId = Number(id);
    const validId = Number.isInteger(novelId) && novelId > 0;

    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        if (!validId) return;

        let active = true;
        setState({ status: "loading" });
        getNovel(novelId)
            .then((novel) => active && setState({ status: "loaded", novel }))
            .catch((e) => {
                if (!active) return;
                const notFound = e instanceof ApiError && e.status === 404;
                setState({
                    status: "error",
                    message: notFound
                        ? "Ce roman n'existe pas ou a été supprimé."
                        : e instanceof Error
                          ? e.message
                          : "Erreur inconnue",
                });
            });

        return () => {
            active = false;
        };
    }, [novelId, validId]);

    if (!validId) {
        return (
            <AppLayout>
                <CenteredBox message="Ce roman n'existe pas." />
            </AppLayout>
        );
    }

    if (state.status === "error") {
        return (
            <AppLayout>
                <CenteredBox message={state.message} />
            </AppLayout>
        );
    }

    if (state.status === "loading") {
        return (
            <AppLayout>
                <HeroSkeleton />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <NovelDetailView
                novel={state.novel}
                // Après un avis, on recharge la fiche : la moyenne est calculée
                // par le serveur, on ne la recalcule jamais côté client.
                onRatingChanged={() => {
                    getNovel(novelId)
                        .then((novel) => setState({ status: "loaded", novel }))
                        .catch(() => {
                            /* la moyenne affichée reste celle d'avant : sans gravité */
                        });
                }}
            />
        </AppLayout>
    );
}

/** Vue « chargée » : centralise les données (chapitres, progression, favoris). */
function NovelDetailView({
    novel,
    onRatingChanged,
}: {
    novel: NovelDetail;
    onRatingChanged: () => void;
}) {
    const { chapters, error } = useChapters(novel.id);
    const { readIds, setRead, setReadBatch } = useNovelProgress(novel.id);
    const { favoriteIds, toggleFavorite } = useChapterFavorites(novel.id);

    // L'onglet vit dans l'URL (?tab=avis) : partageable et restauré au retour.
    const [searchParams, setSearchParams] = useSearchParams();
    const tab: NovelTab = searchParams.get("tab") === "avis" ? "avis" : "chapitres";

    function setTab(next: NovelTab) {
        setSearchParams(
            (prev) => {
                const params = new URLSearchParams(prev);
                if (next === "chapitres") params.delete("tab");
                else params.set("tab", next);
                return params;
            },
            { replace: true },
        );
    }

    // Reprise : premier chapitre non lu (ou le tout premier si tout est lu).
    const firstUnread = chapters?.find((c) => !readIds.has(c.id));
    const resumeChapter = firstUnread ?? (chapters && chapters.length > 0 ? chapters[0] : undefined);
    const allRead = chapters != null && chapters.length > 0 && !firstUnread;
    const readCount = (chapters ?? []).filter((c) => readIds.has(c.id)).length;

    return (
        <>
            <NovelHero
                novel={novel}
                chapterCount={chapters?.length ?? null}
                readCount={readCount}
                resumeTo={resumeChapter ? `/novels/${novel.id}/chapters/${resumeChapter.id}` : null}
                resumeLabel={allRead ? "Relire depuis le début" : "Continuer la lecture"}
            />

            {/* Barre d'onglets collante : avec des milliers de chapitres, les
                avis doivent rester atteignables sans dérouler toute la liste. */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
                    <div
                        role="tablist"
                        aria-label="Contenu du roman"
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/70 p-1.5"
                    >
                        <TabButton
                            icon={LeftToRightListBulletIcon}
                            label="Chapitres"
                            active={tab === "chapitres"}
                            onClick={() => setTab("chapitres")}
                        />
                        <TabButton
                            icon={StarIcon}
                            label="Avis"
                            count={novel.ratingCount}
                            fillIconWhenActive
                            active={tab === "avis"}
                            onClick={() => setTab("avis")}
                        />
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 pb-16 pt-3 sm:px-6">
                {tab === "chapitres" ? (
                    <ChapterList
                        novelId={novel.id}
                        chapters={chapters}
                        error={error}
                        readIds={readIds}
                        favoriteIds={favoriteIds}
                        onToggleRead={setRead}
                        onToggleFavorite={toggleFavorite}
                        onMarkBatch={setReadBatch}
                    />
                ) : (
                    <ReviewSection novelId={novel.id} onReviewChanged={onRatingChanged} />
                )}
            </div>
        </>
    );
}

/**
 * Onglet en pilule. Hauteur fixe (h-9) pour que les deux pilules soient
 * strictement identiques et restent bien contenues dans leur piste.
 */
function TabButton({
    icon,
    label,
    count,
    active,
    fillIconWhenActive,
    onClick,
}: {
    icon: IconSvgElement;
    label: string;
    /** Compteur optionnel — omis quand l'info est déjà affichée en dessous. */
    count?: number | null;
    active: boolean;
    /**
     * Remplit l'icône quand l'onglet est actif. Réservé aux formes fermées
     * (l'étoile) : sur une icône de traits, le remplissage empâte le dessin.
     */
    fillIconWhenActive?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "inline-flex h-9 select-none items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
        >
            <Icon
                icon={icon}
                size={16}
                strokeWidth={2}
                className={cn("shrink-0", active && fillIconWhenActive && "fill-current")}
            />
            {label}
            {count != null && (
                <span
                    className={cn(
                        "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                        active
                            ? "bg-white/25 text-primary-foreground"
                            : "bg-background/70 text-muted-foreground",
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function CenteredBox({ message }: { message: string }) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">{message}</p>
                <Link
                    to="/novels"
                    className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                >
                    Retour à la bibliothèque
                </Link>
            </div>
        </div>
    );
}

function HeroSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
            <div className="h-5 w-28 animate-pulse rounded bg-secondary" />
            <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
                <div className="aspect-3/4 w-44 shrink-0 animate-pulse rounded-2xl bg-secondary sm:w-56" />
                <div className="w-full flex-1 space-y-4">
                    <div className="h-6 w-40 animate-pulse rounded-full bg-secondary" />
                    <div className="h-12 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                    <div className="flex gap-1.5 pt-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
                        ))}
                    </div>
                    <div className="h-12 w-52 animate-pulse rounded-full bg-secondary" />
                    <div className="space-y-2 pt-4">
                        <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                        <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                        <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
                    </div>
                </div>
            </div>
        </div>
    );
}
