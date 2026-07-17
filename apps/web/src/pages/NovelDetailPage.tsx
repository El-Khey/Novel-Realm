import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNovel } from "@/features/novels/novel.service";
import type { NovelDetail } from "@/features/novels/types";
import { NovelHero } from "@/features/novels/components/NovelHero";
import { ChapterList } from "@/features/novels/components/ChapterList";
import { useChapters } from "@/features/novels/hooks/useChapters";
import { useNovelProgress } from "@/features/progress/hooks/useNovelProgress";
import { useChapterFavorites } from "@/features/favorites/hooks/useChapterFavorites";
import { ApiError } from "@/lib/http";
import AppLayout from "@/components/ui/AppLayout";

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

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl px-6 py-10">
                <Link
                    to="/novels"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span aria-hidden="true">←</span> Bibliothèque
                </Link>

                {!validId ? (
                    <ErrorBox message="Ce roman n'existe pas." />
                ) : state.status === "loading" ? (
                    <DetailSkeleton />
                ) : state.status === "error" ? (
                    <ErrorBox message={state.message} />
                ) : (
                    <NovelDetailView novel={state.novel} />
                )}
            </div>
        </AppLayout>
    );
}

/** Vue « chargée » : centralise les données (chapitres, progression, favoris). */
function NovelDetailView({ novel }: { novel: NovelDetail }) {
    const { chapters, error } = useChapters(novel.id);
    const { readIds, setRead, setReadBatch } = useNovelProgress(novel.id);
    const { favoriteIds, toggleFavorite } = useChapterFavorites(novel.id);

    // Reprise : premier chapitre non lu (ou le tout premier si tout est lu).
    const firstUnread = chapters?.find((c) => !readIds.has(c.id));
    const resumeChapter = firstUnread ?? (chapters && chapters.length > 0 ? chapters[0] : undefined);
    const allRead = chapters != null && chapters.length > 0 && !firstUnread;

    return (
        <div className="space-y-8">
            <NovelHero
                novel={novel}
                chapterCount={chapters?.length ?? null}
                resumeTo={resumeChapter ? `/novels/${novel.id}/chapters/${resumeChapter.id}` : null}
                resumeLabel={allRead ? "Relire depuis le début" : "Continuer la lecture"}
            />

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
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link to="/novels" className="mt-3 inline-block text-sm text-primary hover:underline">
                Retour à la bibliothèque
            </Link>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="flex flex-col gap-8 sm:flex-row">
            <div className="aspect-3/4 w-48 shrink-0 animate-pulse rounded-xl bg-secondary" />
            <div className="flex-1 space-y-4">
                <div className="h-7 w-2/3 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                <div className="space-y-2 pt-4">
                    <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
                </div>
            </div>
        </div>
    );
}
