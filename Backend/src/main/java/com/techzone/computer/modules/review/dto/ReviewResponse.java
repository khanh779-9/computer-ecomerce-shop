package com.techzone.computer.modules.review.dto;

import java.time.Instant;

public record ReviewResponse(
    Long id,
    Long productId,
    Long userId,
    Long orderId,
    String userName,
    String userAvatar,
    Integer rating,
    String title,
    String content,
    Boolean isVerifiedPurchase,
    Integer likesCount,
    String status,
    Instant createdAt
) {}
