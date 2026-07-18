import { useEffect, useState } from "react";
import {
    Delete02Icon,
    Loading03Icon,
    MessageMultiple01Icon,
    PencilEdit01Icon,
    SentIcon,
    StarIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { StarInput, StarRating } from "@/features/reviews/components/StarRating";
import {
    RATING_LABELS,
    REVIEW_BODY_MAX,
    type Review,
    type ReviewSummary,
} from "@/features/reviews/types";
import { UserAvatar } from "@/features/profile/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const STARS_DESC = [5, 4, 3, 2, 1] as const;
const relFmt = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

/** « il y a 3 h », « il y a 2 j »… à partir d'une date ISO. */
function relativeTime(iso: string): string {
    const elapsedMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(elapsedMs / 60_000);
    if (minutes < 60) return relFmt.format(-minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (hours < 24) return relFmt.format(-hours, "hour");
    const days = Math.round(hours / 24);
    if (days < 31) return relFmt.format(-days, "day");
    const months = Math.round(days / 30);
    if (months < 12) return relFmt.format(-months, "month");
    return relFmt.format(-Math.round(months / 12), "year");
}

interface Props {
    novelId: number;
    /** Prévient le parent qu'un avis a changé → il rafraîchit la fiche. */
    onReviewChanged: () => void;
}

/**
 * Onglet « Avis » de la fiche roman : synthèse chiffrée avec histogramme,
 * formulaire de son propre avis, puis les avis des autres lecteurs.
 */
export function ReviewSection({ novelId, onReviewChanged }: Props) {
    const { user } = useAuth();
    const {
        reviews,
        total,
        myReview,
        summary,
        hasMore,
        loadingMore,
        error,
        loadMore,
        save,
        remove,
    } = useReviews(novelId);

    // Les avis des AUTRES : le mien est déjà présenté par le formulaire.
    const others = (reviews ?? []).filter((r) => r.userId !== user?.id);

    if (error) {
        return (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Impossible de charger les avis : {error}
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {summary && summary.count > 0 && <RatingPanel summary={summary} />}

            <MyReviewForm
                key={myReview?.id ?? "new"}
                myReview={myReview}
                pseudo={user?.pseudo ?? ""}
                avatarUrl={user?.avatarUrl ?? null}
                onSave={async (rating, body) => {
                    await save(rating, body);
                    onReviewChanged();
                }}
                onRemove={async () => {
                    await remove();
                    onReviewChanged();
                }}
            />

            {reviews === null ? (
                <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />
                    ))}
                </div>
            ) : others.length === 0 ? (
                <EmptyReviews hasMine={myReview !== null} />
            ) : (
                <>
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Les autres lecteurs
                        </h3>
                        <span className="text-xs tabular-nums text-muted-foreground/70">
                            {total - (myReview ? 1 : 0)}
                        </span>
                    </div>

                    <ul className="space-y-3">
                        {others.map((review) => (
                            <li key={review.id}>
                                <ReviewCard review={review} />
                            </li>
                        ))}
                    </ul>

                    {hasMore && (
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                className="rounded-full"
                                disabled={loadingMore}
                                onClick={() => void loadMore()}
                            >
                                {loadingMore && (
                                    <Icon icon={Loading03Icon} size={16} className="animate-spin" />
                                )}
                                {loadingMore ? "Chargement…" : "Voir plus d'avis"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

/** Note globale + histogramme de répartition des notes. */
function RatingPanel({ summary }: { summary: ReviewSummary }) {
    const rounded = Math.round(summary.average);

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
                {/* Note globale */}
                <div className="shrink-0 text-center sm:text-left">
                    <p className="font-heading text-6xl font-extrabold leading-none tabular-nums">
                        {summary.average.toFixed(1)}
                        <span className="text-2xl font-bold text-muted-foreground/60">/5</span>
                    </p>
                    <div className="mt-2.5 flex justify-center sm:justify-start">
                        <StarRating value={summary.average} size={17} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {summary.count} avis · {RATING_LABELS[rounded] ?? "—"}
                    </p>
                </div>

                {/* Histogramme */}
                <div className="min-w-0 flex-1 space-y-1.5">
                    {STARS_DESC.map((star) => {
                        const count = summary.distribution[String(star)] ?? 0;
                        const share = summary.count > 0 ? (count / summary.count) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-3">
                                <span className="flex w-8 shrink-0 items-center gap-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                                    {star}
                                    <Icon
                                        icon={StarIcon}
                                        size={11}
                                        className="fill-current text-gold/70"
                                    />
                                </span>
                                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-gold/70 to-gold transition-[width] duration-500 ease-out"
                                        style={{ width: `${share}%` }}
                                    />
                                </div>
                                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground/70">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/** Formulaire de SON avis : dépôt, modification et suppression. */
function MyReviewForm({
    myReview,
    pseudo,
    avatarUrl,
    onSave,
    onRemove,
}: {
    myReview: Review | null;
    pseudo: string;
    avatarUrl: string | null;
    onSave: (rating: number, body: string | null) => Promise<void>;
    onRemove: () => Promise<void>;
}) {
    const [rating, setRating] = useState(myReview?.rating ?? 0);
    const [body, setBody] = useState(myReview?.body ?? "");
    const [editing, setEditing] = useState(myReview === null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Si l'avis change côté serveur (rechargement), on resynchronise les champs.
    useEffect(() => {
        setRating(myReview?.rating ?? 0);
        setBody(myReview?.body ?? "");
    }, [myReview]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (rating < 1 || saving) return;
        setSaving(true);
        setError(null);
        try {
            await onSave(rating, body.trim() || null);
            setEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove() {
        setSaving(true);
        setError(null);
        try {
            await onRemove();
            setRating(0);
            setBody("");
            setEditing(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setSaving(false);
        }
    }

    // Avis déjà déposé et pas en cours d'édition → affichage en lecture.
    if (myReview && !editing) {
        return (
            <article className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-0.5 bg-linear-to-b from-primary to-primary-active"
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar
                            pseudo={pseudo}
                            avatarUrl={avatarUrl}
                            className="size-11 shrink-0 ring-2 ring-primary/30"
                            textClassName="text-sm"
                        />
                        <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="truncate font-heading text-sm font-bold uppercase tracking-wide">
                                    {pseudo}
                                </span>
                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                    Vous
                                </span>
                            </p>
                            <p className="mt-1 flex items-center gap-2">
                                <StarRating value={myReview.rating} size={14} />
                                <span className="text-xs text-muted-foreground">
                                    {relativeTime(myReview.createdAt)}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setEditing(true)}
                        >
                            <Icon icon={PencilEdit01Icon} size={15} />
                            Modifier
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            disabled={saving}
                            onClick={() => void handleRemove()}
                        >
                            <Icon icon={Delete02Icon} size={15} />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {myReview.body && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                        {myReview.body}
                    </p>
                )}
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </article>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
            <div className="flex flex-col gap-5 sm:flex-row">
                {/* Identité de l'auteur de l'avis */}
                <div className="flex shrink-0 flex-row items-center gap-3 sm:w-24 sm:flex-col sm:gap-2">
                    <UserAvatar
                        pseudo={pseudo}
                        avatarUrl={avatarUrl}
                        className="size-12 ring-2 ring-border sm:size-14"
                        textClassName="text-base"
                    />
                    <p className="truncate font-heading text-xs font-bold uppercase tracking-wide sm:max-w-full sm:text-center">
                        {pseudo}
                    </p>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        {myReview ? "Modifier votre note" : "Votre note pour ce roman"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <StarInput value={rating} onChange={setRating} disabled={saving} />
                        <span
                            className={cn(
                                "text-sm font-semibold",
                                rating > 0 ? "text-foreground" : "text-muted-foreground",
                            )}
                        >
                            {rating > 0 ? RATING_LABELS[rating] : "Choisissez une note"}
                        </span>
                    </div>

                    <div className="relative mt-4">
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value.slice(0, REVIEW_BODY_MAX))}
                            rows={4}
                            placeholder="Partagez votre ressenti sur ce roman (facultatif)…"
                            aria-label="Votre commentaire"
                            className="w-full resize-y rounded-xl border border-transparent bg-secondary px-4 py-3 pb-8 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                        />
                        <span
                            className={cn(
                                "pointer-events-none absolute bottom-3 right-3 text-[11px] tabular-nums",
                                body.length >= REVIEW_BODY_MAX
                                    ? "text-destructive"
                                    : "text-muted-foreground/60",
                            )}
                        >
                            {body.length}/{REVIEW_BODY_MAX}
                        </span>
                    </div>

                    {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
                        {myReview ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-full"
                                onClick={() => {
                                    setRating(myReview.rating);
                                    setBody(myReview.body ?? "");
                                    setEditing(false);
                                    setError(null);
                                }}
                            >
                                Annuler
                            </Button>
                        ) : (
                            (rating > 0 || body.length > 0) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-full"
                                    onClick={() => {
                                        setRating(0);
                                        setBody("");
                                    }}
                                >
                                    Tout effacer
                                </Button>
                            )
                        )}
                        <Button
                            type="submit"
                            disabled={rating < 1 || saving}
                            className="rounded-full px-5 shadow-lg shadow-primary/25"
                        >
                            <Icon icon={SentIcon} size={15} />
                            {saving ? "Envoi…" : myReview ? "Enregistrer" : "Publier l'avis"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

/** Avis d'un autre lecteur. */
function ReviewCard({ review }: { review: Review }) {
    const edited = review.updatedAt !== review.createdAt;

    return (
        <article className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-surface-2">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar
                        pseudo={review.pseudo}
                        avatarUrl={review.avatarUrl}
                        className="size-11 shrink-0 ring-2 ring-border"
                        textClassName="text-sm"
                    />
                    <div className="min-w-0">
                        <p className="truncate font-heading text-sm font-bold uppercase tracking-wide">
                            {review.pseudo}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <StarRating value={review.rating} size={13} />
                            <span className="text-xs text-muted-foreground">
                                {relativeTime(review.createdAt)}
                                {edited && " · modifié"}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Pastille de note + étiquette qualitative */}
                <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-bold tabular-nums text-gold">
                        <Icon icon={StarIcon} size={12} className="fill-current" />
                        {review.rating.toFixed(1)}
                    </span>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        {RATING_LABELS[review.rating]}
                    </p>
                </div>
            </div>

            {review.body && (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                    {review.body}
                </p>
            )}
        </article>
    );
}

function EmptyReviews({ hasMine }: { hasMine: boolean }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-card/50 px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Icon icon={MessageMultiple01Icon} size={22} />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
                {hasMine
                    ? "Personne d'autre n'a encore donné son avis."
                    : "Aucun avis pour le moment — soyez le premier à noter ce roman."}
            </p>
        </div>
    );
}
