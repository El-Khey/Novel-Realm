import { useCallback, useEffect, useState } from "react";
import {
    deleteMyReview,
    getMyReview,
    getReviews,
    upsertReview,
} from "@/features/reviews/review.service";
import type { Review } from "@/features/reviews/types";
import { ApiError } from "@/lib/http";

const PAGE_SIZE = 10;

/**
 * Avis d'un roman : la liste paginée (chargée par tranches) et MON avis, qui
 * est traité à part car il est éditable et remonte en tête du formulaire.
 *
 * <p>Après chaque mutation, la liste est rechargée depuis le début : c'est la
 * seule façon fiable de garder l'ordre (récents d'abord) cohérent avec le
 * serveur sans réimplémenter son tri côté client.
 */
export function useReviews(novelId: number) {
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    /** (Re)charge la première page et mon avis. */
    const reload = useCallback(async () => {
        const [list, mine] = await Promise.all([
            getReviews(novelId, 0, PAGE_SIZE),
            // 404 = « je n'ai pas encore donné d'avis », pas une erreur.
            getMyReview(novelId).catch((e) => {
                if (e instanceof ApiError && e.status === 404) return null;
                throw e;
            }),
        ]);
        setReviews(list.content);
        setTotal(list.totalElements);
        setPage(0);
        setHasMore(list.totalPages > 1);
        setMyReview(mine);
    }, [novelId]);

    useEffect(() => {
        let active = true;
        setReviews(null);
        setError(null);
        reload().catch((e) => {
            if (!active) return;
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        });
        return () => {
            active = false;
        };
    }, [reload]);

    /** Charge la tranche suivante et l'ajoute à la liste. */
    async function loadMore() {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const next = await getReviews(novelId, page + 1, PAGE_SIZE);
            setReviews((prev) => [...(prev ?? []), ...next.content]);
            setPage(next.page);
            setHasMore(next.page + 1 < next.totalPages);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoadingMore(false);
        }
    }

    async function save(rating: number, body: string | null) {
        await upsertReview(novelId, rating, body);
        await reload();
    }

    async function remove() {
        await deleteMyReview(novelId);
        await reload();
    }

    return { reviews, total, myReview, hasMore, loadingMore, error, loadMore, save, remove };
}
