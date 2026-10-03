package com.techzone.computer.modules.review.controller;

import com.techzone.computer.modules.review.dto.ReviewCreateRequest;
import com.techzone.computer.modules.review.dto.ReviewResponse;
import com.techzone.computer.modules.review.dto.ReviewSummaryDto;
import com.techzone.computer.modules.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Product Reviews & Ratings", description = "Endpoints xem và gửi đánh giá sản phẩm")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/products/{productId}/reviews")
    @Operation(summary = "Lấy danh sách đánh giá của sản phẩm")
    public List<ReviewResponse> getReviewsByProduct(@PathVariable Long productId) {
        return reviewService.getReviewsByProduct(productId);
    }

    @GetMapping("/api/products/{productId}/reviews/summary")
    @Operation(summary = "Lấy thống kê đánh giá (điểm trung bình, phân bổ số sao) của sản phẩm")
    public ReviewSummaryDto getProductReviewSummary(@PathVariable Long productId) {
        return reviewService.getProductReviewSummary(productId);
    }

    @PostMapping("/api/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Gửi đánh giá sản phẩm mới (hỗ trợ cả khách đăng nhập và khách vãng lai)")
    public ReviewResponse createReview(
            @Valid @RequestBody ReviewCreateRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = null;
        if (jwt != null) {
            try {
                userId = Long.parseLong(jwt.getSubject());
            } catch (Exception ignored) {}
        }
        return reviewService.createReview(req, userId);
    }

    @GetMapping("/api/reviews/my-reviews")
    @Operation(summary = "Lấy danh sách đánh giá của tôi (yêu cầu đăng nhập)")
    public List<ReviewResponse> getMyReviews(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để xem đánh giá cá nhân");
        }
        Long userId = Long.parseLong(jwt.getSubject());
        return reviewService.getUserReviews(userId);
    }

    @PostMapping("/api/reviews/{id}/like")
    @Operation(summary = "Bấm hữu ích / thích cho một đánh giá")
    public ReviewResponse likeReview(@PathVariable Long id) {
        return reviewService.likeReview(id);
    }
}
