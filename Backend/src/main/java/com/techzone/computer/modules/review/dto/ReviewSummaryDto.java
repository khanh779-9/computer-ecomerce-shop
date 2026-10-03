package com.techzone.computer.modules.review.dto;

import java.util.Map;

public record ReviewSummaryDto(
    Double averageRating,
    Long totalReviews,
    Map<Integer, Long> ratingCounts
) {}
