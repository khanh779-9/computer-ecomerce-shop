package com.techzone.computer.modules.review.service;

import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.review.dto.ReviewCreateRequest;
import com.techzone.computer.modules.review.dto.ReviewResponse;
import com.techzone.computer.modules.review.dto.ReviewSummaryDto;
import com.techzone.computer.modules.review.entity.Review;
import com.techzone.computer.modules.review.repository.ReviewRepository;
import com.techzone.computer.modules.user.entity.Customer;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final OrderRepository orderRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewRepo.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "APPROVED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryDto getProductReviewSummary(Long productId) {
        long totalReviews = reviewRepo.countByProductIdAndStatus(productId, "APPROVED");
        Double avg = reviewRepo.getAverageRatingByProductId(productId);
        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0;

        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, 0L);
        }

        List<Object[]> starCounts = reviewRepo.countRatingsByStar(productId);
        for (Object[] row : starCounts) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                Integer star = ((Number) row[0]).intValue();
                Long count = ((Number) row[1]).longValue();
                ratingCounts.put(star, count);
            }
        }

        return new ReviewSummaryDto(roundedAvg, totalReviews, ratingCounts);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest req, Long optionalUserId) {
        Product product = productRepo.findById(req.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm #" + req.productId()));

        String authorName = req.userName() != null && !req.userName().isBlank() ? req.userName().trim() : "Khách hàng TechZone";
        String authorAvatar = null;
        boolean isVerified = false;

        if (optionalUserId != null) {
            Customer customer = customerRepo.findById(optionalUserId).orElse(null);
            if (customer != null) {
                if (customer.getFullName() != null && !customer.getFullName().isBlank()) {
                    authorName = customer.getFullName();
                }
                authorAvatar = customer.getAvatar();

                // Check verified purchase
                try {
                    isVerified = checkIfUserPurchasedProduct(customer.getId(), req.productId(), req.orderId());
                } catch (Exception e) {
                    log.warn("Error checking verified purchase: {}", e.getMessage());
                }

                // Reward +50 points
                customer.setPoints((customer.getPoints() != null ? customer.getPoints() : 0) + 50);
                customerRepo.save(customer);
            }
        } else if (req.orderId() != null) {
            // Check if order exists and contains product
            Order order = orderRepo.findById(req.orderId()).orElse(null);
            if (order != null && order.getItems().stream().anyMatch(i -> req.productId().equals(i.getProductId()))) {
                isVerified = true;
            }
        }

        Review review = Review.builder()
                .productId(product.getId())
                .userId(optionalUserId)
                .orderId(req.orderId())
                .userName(authorName)
                .userAvatar(authorAvatar)
                .rating(req.rating())
                .title(req.title() != null ? req.title().trim() : null)
                .content(req.content().trim())
                .isVerifiedPurchase(isVerified)
                .likesCount(0)
                .status("APPROVED")
                .build();

        Review saved = reviewRepo.save(review);

        // Recalculate product rating & review count
        long totalReviews = reviewRepo.countByProductIdAndStatus(product.getId(), "APPROVED");
        Double avg = reviewRepo.getAverageRatingByProductId(product.getId());
        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : req.rating().doubleValue();

        product.setReviewCount((int) totalReviews);
        product.setRating(roundedAvg);
        productRepo.save(product);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public ReviewResponse likeReview(Long reviewId) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá #" + reviewId));
        review.setLikesCount((review.getLikesCount() != null ? review.getLikesCount() : 0) + 1);
        Review saved = reviewRepo.save(review);
        return toResponse(saved);
    }

    private boolean checkIfUserPurchasedProduct(Long userId, Long productId, Long specificOrderId) {
        if (specificOrderId != null) {
            Order order = orderRepo.findById(specificOrderId).orElse(null);
            if (order != null && userId.equals(order.getUserId())) {
                return order.getItems().stream().anyMatch(item -> productId.equals(item.getProductId()));
            }
        }
        return orderRepo.findAll().stream()
                .filter(o -> userId.equals(o.getUserId()))
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> productId.equals(item.getProductId()));
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getProductId(),
                r.getUserId(),
                r.getOrderId(),
                r.getUserName(),
                r.getUserAvatar(),
                r.getRating(),
                r.getTitle(),
                r.getContent(),
                r.getIsVerifiedPurchase(),
                r.getLikesCount(),
                r.getStatus(),
                r.getCreatedAt()
        );
    }
}
