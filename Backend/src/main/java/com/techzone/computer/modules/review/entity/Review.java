package com.techzone.computer.modules.review.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_reviews_product_id", columnList = "product_id"),
    @Index(name = "idx_reviews_user_id", columnList = "user_id"),
    @Index(name = "idx_reviews_rating", columnList = "rating"),
    @Index(name = "idx_reviews_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "user_avatar", length = 500)
    private String userAvatar;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(name = "is_verified_purchase", nullable = false)
    private Boolean isVerifiedPurchase = false;

    @Builder.Default
    @Column(name = "likes_count", nullable = false)
    private Integer likesCount = 0;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "APPROVED";

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = true)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
