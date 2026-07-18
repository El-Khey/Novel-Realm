import { useEffect, useState } from "react";
import {
    Delete02Icon,
    Loading03Icon,
    MessageMultiple01Icon,
    PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { StarInput, StarRating } from "@/features/reviews/components/StarRating";
import { REVIEW_BODY_MAX, type Review } from "@/features/reviews/types";
import { UserAvatar } from "@/features/profile/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

interface Props {
    novelId: number;
    /** Moyenne et nombre d'avis venant de la fiche (source de vérité serveur). */
    averageRating: number;
    ratingCount: number;
    /** Prévient le parent qu'un avis a changé → il rafraîchit la moyenne. */
    onReviewChanged: () => void;
}

/**
 * Espace « Avis » de la fiche roman : la note moyenne, le formulaire de son
 * propre avis (note obligatoire, commentaire facultatif) et la liste des avis
 * des autres lecteurs.
 */
export function ReviewSection({ novelId, averageRating, ratingCount, onReviewChanged }: Props) {
    const { user } = useAuth();
    const { reviews, total, myReview, hasMore, loadingMore, error, loadMore, save, remove } =
        useReviews(novelId);

    // Les avis des AUTRES : le mien est déjà présenté par le formulaire.
    const others = (reviews ?? []).filter((r) => r.userId !== user?.id);

    return (
        <section className="border-t border-border pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="flex items-baseline gap-2 font-heading text-xl font-bold tracking-tight">
                    Avis
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                        {total}
                    </span>
                </h2>

                {ratingCount > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="font-heading text-3xl font-extrabold leading-none tabular-nums">
                            {averageRating.toFixed(1)}
                            <span className="text-base font-semibold text-muted-foreground">/5</span>
                        </span>
                        <div>
                            <StarRating value={averageRating} size={15} />
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {ratingCount} avis
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <MyReviewForm
                key={myReview?.id ?? "new"}
                myReview={myReview}
                onSave={async (rating, body) => {
                    await save(rating, body);
                    onReviewChanged();
                }}
                onRemove={async () => {
                    await remove();
                    onReviewChanged();
                }}
            />

            {error ? (
                <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Impossible de charger les avis : {error}
                </p>
            ) : reviews === null ? (
                <div className="mt-6 space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
                    ))}
                </div>
            ) : others.length === 0 ? (
                <EmptyReviews hasMine={myReview !== null} />
            ) : (
                <>
                    <ul className="mt-6 space-y-3">
                        {others.map((review) => (
                            <li key={review.id}>
                                <ReviewCard review={review} />
                            </li>
                        ))}
                    </ul>

                    {hasMore && (
                        <div className="mt-6 flex justify-center">
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
        </section>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

/** Formulaire de SON avis : dépôt, modification et suppression. */
function MyReviewForm({
    myReview,
    onSave,
    onRemove,
}: {
    myReview: Review | null;
    onSave: (rating: number, body: string | null) => Promise<void>;
    onRemove: () => Promise<void>;
}) {
    const [rating, setRating] = useState(myReview?.rating ?? 0);
    const [body, setBody] = useState(myReview?.body ?? "");
    const [editing, setEditing] = useState(myReview === null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Si l'avis change côté serveur (rechargement), on resynchronise le champ.
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

    // Avis déjà déposé et pas en cours d'édition → on l'affiche en lecture.
    if (myReview && !editing) {
        return (
            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <StarRating value={myReview.rating} size={17} />
                        <span className="text-sm font-semibold">Votre avis</span>
                    </div>
                    <div className="flex gap-2">
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
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                        {myReview.body}
                    </p>
                )}
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">
                {myReview ? "Modifier votre avis" : "Donner votre avis"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
                <StarInput value={rating} onChange={setRating} disabled={saving} />
                <span className="text-sm text-muted-foreground">
                    {rating > 0 ? `${rating}/5` : "Choisissez une note"}
                </span>
            </div>

            <div className="relative mt-4">
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, REVIEW_BODY_MAX))}
                    rows={4}
                    placeholder="Votre ressenti sur ce roman (facultatif)…"
                    aria-label="Votre commentaire"
                    className="w-full resize-y rounded-xl border border-transparent bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                />
                <span
                    className={cn(
                        "pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums",
                        body.length >= REVIEW_BODY_MAX
                            ? "text-destructive"
                            : "text-muted-foreground/60",
                    )}
                >
                    {body.length}/{REVIEW_BODY_MAX}
                </span>
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <div className="mt-4 flex items-center gap-2">
                <Button type="submit" disabled={rating < 1 || saving} className="rounded-full px-5">
                    {saving ? "Envoi…" : myReview ? "Enregistrer" : "Publier mon avis"}
                </Button>
                {myReview && (
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
                )}
            </div>
        </form>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const edited = review.updatedAt !== review.createdAt;

    return (
        <article className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
                <UserAvatar
                    pseudo={review.pseudo}
                    avatarUrl={review.avatarUrl}
                    className="size-9 shrink-0"
                    textClassName="text-xs"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="truncate text-sm font-semibold">{review.pseudo}</span>
                        <StarRating value={review.rating} size={13} />
                        <span className="text-xs text-muted-foreground">
                            {dateFmt.format(new Date(review.createdAt))}
                            {edited && " · modifié"}
                        </span>
                    </div>
                    {review.body && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                            {review.body}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

function EmptyReviews({ hasMine }: { hasMine: boolean }) {
    return (
        <div className="mt-6 rounded-2xl border border-border/70 bg-card/50 px-6 py-10 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Icon icon={MessageMultiple01Icon} size={20} />
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
                {hasMine
                    ? "Personne d'autre n'a encore donné son avis."
                    : "Aucun avis pour le moment — soyez le premier à noter ce roman."}
            </p>
        </div>
    );
}
