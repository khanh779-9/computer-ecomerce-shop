package com.techzone.computer.modules.review.service;

import com.techzone.computer.modules.review.dto.ReviewCreateRequest;
import com.techzone.computer.modules.review.dto.ReviewResponse;
import com.techzone.computer.modules.review.dto.ReviewSummaryDto;

import java.util.List;

public interface ReviewService {

    List<ReviewResponse> getReviewsByProduct(Long productId);

    ReviewSummaryDto getProductReviewSummary(Long productId);

    List<ReviewResponse> getUserReviews(Long userId);

    ReviewResponse createReview(ReviewCreateRequest req, Long optionalUserId);

    ReviewResponse likeReview(Long reviewId);
}
