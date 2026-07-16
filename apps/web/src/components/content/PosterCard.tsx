import { Link } from "react-router-dom";
import { PlayIcon } from "@hugeicons/core-free-icons";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NOVEL_STATUS } from "@/features/novels/status";
import type { Novel } from "@/features/novels/types";
import { Icon } from "@/components/ui/icon";

interface Props {
    novel: Novel;
    /** Chapitres non lus (badge en coin), optionnel. */
    remaining?: number;
}

/**
 * Carte « poster » d'un roman façon Spotify : couverture qui zoome au survol,
 * bouton de lecture cramoisi qui surgit, titre + auteur dessous. Toute la carte
 * est un lien vers la fiche du roman.
 */
export function PosterCard({ novel, remaining }: Props) {
    const status = NOVEL_STATUS[novel.status];

    return (
        <Link
            to={`/novels/${novel.id}`}
            aria-label={`${novel.title}, par ${novel.author}`}
            className="group/card block rounded-xl p-2 transition-colors hover:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            <div className="relative mb-3 overflow-hidden rounded-lg shadow-lg shadow-black/40 ring-1 ring-white/5">
                <NovelCover
                    title={novel.title}
                    coverImageUrl={novel.coverImageUrl}
                    className="aspect-2/3 transition-transform duration-500 ease-out group-hover/card:scale-[1.05]"
                />

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

                <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                    {status.label}
                </span>

                {remaining != null && remaining > 0 && (
                    <span
                        className="absolute bottom-2 left-2 grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow"
                        title={`${remaining} chapitre${remaining > 1 ? "s" : ""} non lu${remaining > 1 ? "s" : ""}`}
                    >
                        {remaining}
                    </span>
                )}

                {/* Bouton lecture (décoratif — le lien porte déjà la carte) */}
                <span className="absolute bottom-2 right-2 grid size-11 translate-y-3 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl shadow-primary/40 transition-all duration-300 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100">
                    <Icon icon={PlayIcon} size={20} strokeWidth={2.5} />
                </span>
            </div>

            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{novel.title}</h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{novel.author}</p>
        </Link>
    );
}
