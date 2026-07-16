import { Link } from "react-router-dom";
import { PlayIcon } from "@hugeicons/core-free-icons";
import { NovelCover } from "@/features/novels/components/NovelCover";
import type { HistoryEntry } from "@/features/history/types";
import { Icon } from "@/components/ui/icon";

/**
 * Carte « Reprendre la lecture » : vignette + roman + dernier chapitre ouvert +
 * barre de progression. Mène droit au lecteur, à la position sauvegardée.
 */
export function ContinueCard({ entry }: { entry: HistoryEntry }) {
    const progress = entry.read ? 100 : Math.max(6, entry.scrollPosition);

    return (
        <Link
            to={`/novels/${entry.novelId}/chapters/${entry.chapterId}`}
            aria-label={`Reprendre ${entry.novelTitle}, chapitre ${entry.chapterNumber}`}
            className="group flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-white/5 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            <div className="w-12 shrink-0 overflow-hidden rounded-md shadow-md shadow-black/40">
                <NovelCover
                    title={entry.novelTitle}
                    coverImageUrl={entry.novelCoverImageUrl}
                    className="aspect-3/4"
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{entry.novelTitle}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                    Ch. {entry.chapterNumber} · {entry.chapterTitle}
                </p>
                <div
                    className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progression : ${progress}%`}
                >
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg shadow-primary/30 transition-all group-hover:opacity-100">
                <Icon icon={PlayIcon} size={16} strokeWidth={2.5} />
            </span>
        </Link>
    );
}
