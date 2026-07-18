package com.novelrealm.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.novelrealm.exception.ReviewNotFoundException;
import com.novelrealm.model.Novel;
import com.novelrealm.model.Review;
import com.novelrealm.model.User;
import com.novelrealm.repository.ReviewRepository;

/**
 * Avis des utilisateurs sur les romans. Un utilisateur n'a qu'UN avis par
 * roman : {@link #upsert} le crée ou le met à jour, sans jamais en empiler.
 */
@Service
public class ReviewService {

    /** Garde-fou de pagination : au-delà, on plafonne. */
    private static final int MAX_PAGE_SIZE = 50;

    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final NovelService novelService;

    public ReviewService(
            ReviewRepository reviewRepository,
            UserService userService,
            NovelService novelService) {
        this.reviewRepository = reviewRepository;
        this.userService = userService;
        this.novelService = novelService;
    }

    /** Les avis d'un roman, les plus récents d'abord. */
    @Transactional(readOnly = true)
    public Page<Review> listForNovel(Long novelId, int page, int size) {
        novelService.findById(novelId); // 404 si le roman n'existe pas
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        return reviewRepository.findByNovel_Id(
                novelId,
                PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    /** L'avis de l'utilisateur connecté sur ce roman, ou 404 s'il n'en a pas. */
    @Transactional(readOnly = true)
    public Review getOwn(String email, Long novelId) {
        User user = userService.findByEmail(email);
        return reviewRepository.findByUser_IdAndNovel_Id(user.getId(), novelId)
                .orElseThrow(() -> new ReviewNotFoundException(novelId));
    }

    /**
     * Dépose SON avis, ou met à jour celui qui existe déjà. Le commentaire vide
     * est ramené à {@code null} : « pas de commentaire » et « commentaire vide »
     * sont la même chose.
     */
    @Transactional
    public Review upsert(String email, Long novelId, int rating, String body) {
        User user = userService.findByEmail(email);
        Novel novel = novelService.findById(novelId);
        String cleaned = normalizeBody(body);

        return reviewRepository.findByUser_IdAndNovel_Id(user.getId(), novelId)
                .map(existing -> {
                    existing.setRating((short) rating);
                    existing.setBody(cleaned);
                    return existing; // @Transactional → flush automatique
                })
                .orElseGet(() -> reviewRepository.save(
                        new Review(user, novel, (short) rating, cleaned)));
    }

    /** Retire SON avis. 404 s'il n'y en avait pas. */
    @Transactional
    public void deleteOwn(String email, Long novelId) {
        reviewRepository.delete(getOwn(email, novelId));
    }

    /** Moyenne et nombre d'avis d'un roman (calculés en base). */
    @Transactional(readOnly = true)
    public ReviewRepository.RatingSummary summarize(Long novelId) {
        return reviewRepository.summarizeByNovelId(novelId);
    }

    private static String normalizeBody(String body) {
        if (body == null) {
            return null;
        }
        String cleaned = body.strip();
        return cleaned.isEmpty() ? null : cleaned;
    }
}
