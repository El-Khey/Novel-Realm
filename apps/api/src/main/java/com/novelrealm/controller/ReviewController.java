package com.novelrealm.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.novelrealm.dto.PageResponse;
import com.novelrealm.dto.ReviewResponse;
import com.novelrealm.dto.UpsertReviewRequest;
import com.novelrealm.model.Review;
import com.novelrealm.model.User;
import com.novelrealm.service.ReviewService;

import jakarta.validation.Valid;

/**
 * API des avis (note + commentaire) d'un roman. L'auteur d'un avis est toujours
 * l'utilisateur connecté : on ne prend jamais d'id utilisateur dans l'URL, donc
 * personne ne peut écrire ou supprimer au nom d'un autre.
 */
@RestController
@RequestMapping("/api/novels/{novelId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /** GET /api/novels/{novelId}/reviews?page=&size= — les avis, récents d'abord. */
    @GetMapping
    public ResponseEntity<PageResponse<ReviewResponse>> list(
            @PathVariable Long novelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> body = reviewService.listForNovel(novelId, page, size)
                .map(ReviewController::toResponse);
        return ResponseEntity.ok(PageResponse.from(body));
    }

    /** GET /api/novels/{novelId}/reviews/me — mon avis (404 si je n'en ai pas). */
    @GetMapping("/me")
    public ResponseEntity<ReviewResponse> myReview(
            @PathVariable Long novelId,
            Authentication authentication) {
        return ResponseEntity.ok(toResponse(reviewService.getOwn(authentication.getName(), novelId)));
    }

    /** PUT /api/novels/{novelId}/reviews — dépose ou met à jour mon avis. */
    @PutMapping
    public ResponseEntity<ReviewResponse> upsert(
            @PathVariable Long novelId,
            @Valid @RequestBody UpsertReviewRequest request,
            Authentication authentication) {
        Review review = reviewService.upsert(
                authentication.getName(), novelId, request.rating(), request.body());
        return ResponseEntity.ok(toResponse(review));
    }

    /** DELETE /api/novels/{novelId}/reviews/me — retire mon avis (204). */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMine(
            @PathVariable Long novelId,
            Authentication authentication) {
        reviewService.deleteOwn(authentication.getName(), novelId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Entité → DTO. L'auteur est déjà chargé (@EntityGraph du repository pour la
     * liste, session ouverte pour les mutations), donc le traverser est sûr.
     */
    private static ReviewResponse toResponse(Review review) {
        User author = review.getUser();
        return new ReviewResponse(
                review.getId(),
                author.getId(),
                author.getPseudo(),
                author.getAvatarUrl(),
                review.getRating(),
                review.getBody(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }
}
