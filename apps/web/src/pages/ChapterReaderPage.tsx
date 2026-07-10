import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getChapter } from "@/features/novels/chapter.service";
import type { ChapterDetail } from "@/features/novels/types";
import { ApiError } from "@/lib/http";
import AppLayout from "@/components/ui/AppLayout";

// Page de lecture — version simple/temporaire : récupère le chapitre et
// affiche son contenu. À enrichir plus tard (préc/suivant, réglages…).

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; chapter: ChapterDetail };

export default function ChapterReaderPage() {
    const { chapterId } = useParams();
    const id = Number(chapterId);
    const validId = Number.isInteger(id) && id > 0;

    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        if (!validId) return;

        let active = true;
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

                        <p className="text-sm text-muted-foreground">Chapitre {state.chapter.chapterNumber}</p>
                        <h1 className="mt-1 mb-6 text-2xl font-bold tracking-tight">{state.chapter.title}</h1>

                        <div className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                            {state.chapter.content}
                        </div>
                    </>
                )}
            </article>
        </AppLayout>
    );
}
