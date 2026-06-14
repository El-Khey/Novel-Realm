import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNovel } from "@/features/novels/novel.service";
import type { Novel } from "@/features/novels/types";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NOVEL_STATUS } from "@/features/novels/status";
import { ApiError } from "@/lib/http";
import AppLayout from "@/components/ui/AppLayout";
import { Badge } from "@/components/ui/badge";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; novel: Novel };

export default function NovelDetailPage() {
    const { id } = useParams();
    const novelId = Number(id);
    const validId = Number.isInteger(novelId) && novelId > 0;

    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        if (!validId) return;

        let active = true;
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
                    <NovelDetail novel={state.novel} />
                )}
            </div>
        </AppLayout>
    );
}

function NovelDetail({ novel }: { novel: Novel }) {
    const status = NOVEL_STATUS[novel.status];

    return (
        <div className="flex flex-col gap-8 sm:flex-row">
            <NovelCover
                title={novel.title}
                coverImageUrl={novel.coverImageUrl}
                className="w-48 shrink-0 rounded-xl ring-1 ring-foreground/10"
            />

            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight">{novel.title}</h1>
                        <Badge variant={status.variant} className="shrink-0">
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">par {novel.author}</p>
                </div>

                <div className="border-t border-border pt-4">
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Résumé
                    </h2>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                        {novel.description}
                    </p>
                </div>
            </div>
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
