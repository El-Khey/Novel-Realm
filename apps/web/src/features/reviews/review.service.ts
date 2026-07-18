import { request, requestNoContent, type PageResponse } from "@/lib/http";
import type { Review, ReviewSummary } from "./types";

/** Points d'entrée HTTP des avis d'un roman. */

/** Moyenne, total et répartition par note (pour l'histogramme). */
export function getReviewSummary(novelId: number): Promise<ReviewSummary> {
    return request<ReviewSummary>(`/novels/${novelId}/reviews/summary`);
}

export function getReviews(
    novelId: number,
    page = 0,
    size = 10,
): Promise<PageResponse<Review>> {
    return request<PageResponse<Review>>(
        `/novels/${novelId}/reviews?page=${page}&size=${size}`,
    );
}

/** Mon avis sur ce roman — lève une ApiError 404 si je n'en ai pas. */
export function getMyReview(novelId: number): Promise<Review> {
    return request<Review>(`/novels/${novelId}/reviews/me`);
}

/** Dépose ou met à jour mon avis (un seul par roman). */
export function upsertReview(
    novelId: number,
    rating: number,
    body: string | null,
): Promise<Review> {
    return request<Review>(`/novels/${novelId}/reviews`, {
        method: "PUT",
        body: JSON.stringify({ rating, body }),
    });
}

export function deleteMyReview(novelId: number): Promise<void> {
    return requestNoContent(`/novels/${novelId}/reviews/me`, { method: "DELETE" });
}
