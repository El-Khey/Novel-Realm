import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft01Icon,
    BookOpen01Icon,
    CheckmarkCircle02Icon,
    PlayIcon,
    QuillWrite01Icon,
} from "@hugeicons/core-free-icons";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NOVEL_STATUS } from "@/features/novels/status";
import type { NovelDetail } from "@/features/novels/types";
import { StarRating } from "@/features/reviews/components/StarRating";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
    novel: NovelDetail;
    /** Nombre de chapitres (null tant que la liste charge). */
    chapterCount: number | null;
    /** Chapitres déjà lus (pour la barre de progression). */
    readCount: number;
    /** Lien de reprise, ou null si aucun chapitre. */
    resumeTo: string | null;
    resumeLabel: string;
}

/**
 * En-tête de la fiche roman, pleine largeur : la couverture est floutée en
 * nappe de couleur derrière tout le bloc (« reflets »), la couverture elle-même
 * est posée sur son reflet, et la colonne de droite porte l'identité du roman,
 * la reprise de lecture, la progression et le résumé.
 */
export function NovelHero({ novel, chapterCount, readCount, resumeTo, resumeLabel }: Props) {
    const status = NOVEL_STATUS[novel.status];
    const cover = novel.coverImageUrl;

    const total = chapterCount ?? 0;
    const percent = total > 0 ? Math.round((readCount / total) * 100) : 0;
    const finished = total > 0 && readCount >= total;

    return (
        <header className="relative isolate overflow-hidden">
            {/* ── Nappe ambiante : la couverture floutée teinte tout le haut ── */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                {cover ? (
                    // Débordement volontaire (-top / h-160%) : les bords délavés
                    // par le flou tombent hors cadre, seule la couleur reste.
                    <img
                        src={cover}
                        alt=""
                        className="absolute -top-1/4 left-1/2 h-[160%] w-[140%] max-w-none -translate-x-1/2 object-cover opacity-55 blur-[80px] saturate-200"
                    />
                ) : (
                    <div className="absolute -right-24 -top-32 size-96 rounded-full bg-primary/20 blur-3xl" />
                )}

                {/* Voiles : on garde le texte lisible et on fond vers le noir */}
                <div className="absolute inset-0 bg-linear-to-b from-background/30 via-background/70 to-background" />
                <div className="absolute inset-0 bg-linear-to-r from-background/55 via-transparent to-background/55" />
            </div>

            <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16">
                <Link
                    to="/novels"
                    className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <Icon icon={ArrowLeft01Icon} size={16} />
                    Bibliothèque
                </Link>

                <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
                    {/* ── Couverture posée sur son reflet ────────────────── */}
                    <div className="relative shrink-0">
                        {/* Halo coloré tiré de la couverture */}
                        {cover && (
                            <div
                                aria-hidden
                                className="absolute -inset-6 -z-10 rounded-[2rem] bg-cover bg-center opacity-60 blur-3xl saturate-200"
                                style={{ backgroundImage: `url(${cover})` }}
                            />
                        )}

                        <NovelCover
                            title={novel.title}
                            coverImageUrl={cover}
                            className="w-44 rounded-2xl shadow-2xl shadow-black/70 ring-1 ring-white/15 sm:w-56"
                        />

                        {/* Reflet « posé sur une vitre » */}
                        {cover && (
                            <div
                                aria-hidden
                                className="mask-reflect absolute inset-x-0 top-full h-20 overflow-hidden rounded-b-2xl"
                            >
                                <img
                                    src={cover}
                                    alt=""
                                    className="aspect-3/4 w-full -scale-y-100 object-cover blur-[1px]"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Identité ───────────────────────────────────────── */}
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                        {/* Méta : statut · chapitres */}
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        novel.status === "COMPLETED" ? "bg-emerald-400" : "bg-primary",
                                    )}
                                />
                                {status.label}
                            </span>
                            {chapterCount != null && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Icon icon={BookOpen01Icon} size={14} />
                                    {chapterCount} chapitre{chapterCount > 1 ? "s" : ""}
                                </span>
                            )}
                            {novel.ratingCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <StarRating value={novel.averageRating} size={13} />
                                    <span className="font-semibold text-foreground">
                                        {novel.averageRating.toFixed(1)}
                                    </span>
                                    ({novel.ratingCount})
                                </span>
                            )}
                        </div>

                        <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                            {novel.title}
                        </h1>

                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Icon icon={QuillWrite01Icon} size={14} />
                            par <span className="font-semibold text-foreground/90">{novel.author}</span>
                        </p>

                        {novel.genres.length > 0 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                                {novel.genres.map((g) => (
                                    <Link
                                        key={g.id}
                                        to={`/explorer?genreId=${g.id}`}
                                        className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/12 hover:text-foreground"
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* ── Action + progression ───────────────────────── */}
                        {resumeTo && (
                            <div className="mt-7 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                                <Link
                                    to={resumeTo}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:bg-primary-active hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    <Icon
                                        icon={finished ? CheckmarkCircle02Icon : PlayIcon}
                                        size={17}
                                        strokeWidth={2.4}
                                        className={cn(!finished && "fill-current")}
                                    />
                                    {resumeLabel}
                                </Link>

                                {total > 0 && (
                                    <div className="w-full min-w-0 max-w-xs">
                                        <div className="flex items-baseline justify-between gap-3 text-xs">
                                            <span className="font-medium text-muted-foreground">
                                                {readCount} / {total} lus
                                            </span>
                                            <span
                                                className={cn(
                                                    "font-heading font-bold tabular-nums",
                                                    finished ? "text-emerald-400" : "text-primary",
                                                )}
                                            >
                                                {percent}%
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-[width] duration-500 ease-out",
                                                    finished
                                                        ? "bg-emerald-400"
                                                        : "bg-linear-to-r from-primary to-primary-active",
                                                )}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Synopsis text={novel.description} />
                    </div>
                </div>
            </div>
        </header>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

/** Résumé replié au-delà de ~5 lignes, avec un fondu et un bouton d'ouverture. */
function Synopsis({ text }: { text: string }) {
    const [expanded, setExpanded] = useState(false);
    // Seuil empirique : en dessous, le repli n'apporte rien.
    const collapsible = text.length > 420;

    return (
        <div className="mt-8 text-left">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Résumé
            </h2>
            <div className="relative mt-2.5">
                <p
                    className={cn(
                        "whitespace-pre-line text-sm leading-relaxed text-foreground/85",
                        collapsible && !expanded && "line-clamp-5",
                    )}
                >
                    {text}
                </p>
                {collapsible && !expanded && (
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-background to-transparent"
                    />
                )}
            </div>
            {collapsible && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 text-xs font-semibold text-primary transition-colors hover:text-primary-active"
                >
                    {expanded ? "Réduire" : "Lire la suite"}
                </button>
            )}
        </div>
    );
}
