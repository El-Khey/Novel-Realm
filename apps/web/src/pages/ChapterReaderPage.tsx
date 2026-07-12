import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getChapter } from "@/features/novels/chapter.service";
import { useChapters } from "@/features/novels/hooks/useChapters";
import { useNovelProgress } from "@/features/progress/hooks/useNovelProgress";
import type { ChapterDetail } from "@/features/novels/types";
import { ApiError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/ui/AppLayout";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; chapter: ChapterDetail };

export default function ChapterReaderPage() {
    const { novelId: novelIdParam, chapterId } = useParams();
    const novelId = Number(novelIdParam);
    const id = Number(chapterId);
    const validId = Number.isInteger(id) && id > 0;

    const [state, setState] = useState<LoadState>({ status: "loading" });

    // Liste des chapitres (pour préc./suivant) + progression de lecture.
    const { chapters } = useChapters(novelId);
    const { progressById, readIds, loaded: progressLoaded, setRead, savePosition } =
        useNovelProgress(novelId);

    const loaded = state.status === "loaded";
    // On ne restaure la position qu'une fois par chapitre (mémorise l'id restauré).
    const restoredRef = useRef<number | null>(null);

    useEffect(() => {
        if (!validId) return;

        let active = true;
        setState({ status: "loading" });
        getChapter(id)
            .then((chapter) => active && setState({ status: "loaded", chapter }))
            .catch((e) => {
                if (!active) return;
                const notFound = e instanceof ApiError && e.status === 404;
                setState({
                    status: "error",
                    message: notFound
                        ? "Ce chapitre n'existe pas."
                        : e instanceof Error
                          ? e.message
                          : "Erreur inconnue",
                });
            });

        return () => {
            active = false;
        };
    }, [id, validId]);

    // Restaure la position de reprise une fois le chapitre ET la progression chargés.
    useEffect(() => {
        if (!loaded || !progressLoaded || restoredRef.current === id) return;
        restoredRef.current = id;
        const saved = progressById.get(id)?.scrollPosition ?? 0;
        if (saved > 0 && saved < 100) {
            requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                if (max > 0) window.scrollTo({ top: (saved / 100) * max });
            });
        }
    }, [loaded, progressLoaded, id, progressById]);

    // Sauvegarde la position de lecture (débounce) pendant le défilement.
    useEffect(() => {
        if (!loaded) return;
        let timer: ReturnType<typeof setTimeout>;
        function onScroll() {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                const percent = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
                savePosition(id, percent);
            }, 800);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", onScroll);
        };
    }, [loaded, id, savePosition]);

    // Chapitres préc./suivant, dérivés de la liste triée par numéro.
    const index = chapters?.findIndex((c) => c.id === id) ?? -1;
    const prevId = index > 0 ? chapters![index - 1].id : null;
    const nextId =
        chapters && index >= 0 && index < chapters.length - 1 ? chapters[index + 1].id : null;

    const isRead = readIds.has(id);

    return (
        <AppLayout>
            <article className="mx-auto max-w-2xl px-6 py-10">
                {!validId || state.status === "error" ? (
                    <p className="text-sm text-muted-foreground">
                        {validId && state.status === "error" ? state.message : "Ce chapitre n'existe pas."}
                    </p>
                ) : state.status === "loading" ? (
                    <p className="text-sm text-muted-foreground">Chargement…</p>
                ) : (
                    <>
                        <Link
                            to={`/novels/${state.chapter.novelId}`}
                            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <span aria-hidden="true">←</span> Retour au roman
                        </Link>

                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Chapitre {state.chapter.chapterNumber}
                                </p>
                                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                                    {state.chapter.title}
                                </h1>
                            </div>
                            <Button
                                variant={isRead ? "secondary" : "outline"}
                                size="sm"
                                className="shrink-0"
                                onClick={() => setRead(id, !isRead)}
                            >
                                {isRead ? "✓ Lu" : "Marquer comme lu"}
                            </Button>
                        </div>

                        <ChapterNav novelId={novelId} prevId={prevId} nextId={nextId} />

                        <div className="my-8 whitespace-pre-line text-sm leading-7 text-foreground/90">
                            {state.chapter.content}
                        </div>

                        <ChapterNav novelId={novelId} prevId={prevId} nextId={nextId} />
                    </>
                )}
            </article>
        </AppLayout>
    );
}

/** Barre de navigation préc./suivant. Un bouton est désactivé s'il n'y a pas de chapitre. */
function ChapterNav({
    novelId,
    prevId,
    nextId,
}: {
    novelId: number;
    prevId: number | null;
    nextId: number | null;
}) {
    return (
        <nav className="flex items-center justify-between gap-3 border-y border-border py-3">
            {prevId != null ? (
                <Button asChild variant="ghost" size="sm">
                    <Link to={`/novels/${novelId}/chapters/${prevId}`}>← Précédent</Link>
                </Button>
            ) : (
                <Button variant="ghost" size="sm" disabled>
                    ← Précédent
                </Button>
            )}

            {nextId != null ? (
                <Button asChild variant="ghost" size="sm">
                    <Link to={`/novels/${novelId}/chapters/${nextId}`}>Suivant →</Link>
                </Button>
            ) : (
                <Button variant="ghost" size="sm" disabled>
                    Suivant →
                </Button>
            )}
        </nav>
    );
}
