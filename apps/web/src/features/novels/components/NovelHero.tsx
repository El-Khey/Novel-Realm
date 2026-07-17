import { Link } from "react-router-dom";
import { BookOpen01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NOVEL_STATUS } from "@/features/novels/status";
import type { NovelDetail } from "@/features/novels/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface Props {
    novel: NovelDetail;
    /** Nombre de chapitres (null tant que la liste charge). */
    chapterCount: number | null;
    /** Lien de reprise, ou null si aucun chapitre. */
    resumeTo: string | null;
    resumeLabel: string;
}

/**
 * En-tête de la fiche roman : couverture, statut, nombre de chapitres, titre,
 * auteur, genres (cliquables → catalogue filtré), reprise de lecture, résumé.
 */
export function NovelHero({ novel, chapterCount, resumeTo, resumeLabel }: Props) {
    const status = NOVEL_STATUS[novel.status];

    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <NovelCover
                title={novel.title}
                coverImageUrl={novel.coverImageUrl}
                className="w-40 shrink-0 self-center rounded-xl shadow-lg ring-1 ring-foreground/10 sm:w-52 sm:self-start"
            />

            <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {chapterCount != null && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Icon icon={BookOpen01Icon} size={14} />
                                {chapterCount} chapitre{chapterCount > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                        {novel.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">par {novel.author}</p>
                </div>

                {novel.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {novel.genres.map((g) => (
                            <Link
                                key={g.id}
                                to={`/explorer?genreId=${g.id}`}
                                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
                            >
                                {g.name}
                            </Link>
                        ))}
                    </div>
                )}

                {resumeTo && (
                    <Button asChild>
                        <Link to={resumeTo}>
                            <Icon icon={PlayIcon} size={16} />
                            {resumeLabel}
                        </Link>
                    </Button>
                )}

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
