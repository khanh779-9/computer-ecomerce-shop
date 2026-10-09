package com.techzone.computer.modules.product.dto;

import com.techzone.computer.modules.product.entity.ProductImage;

import java.time.Instant;

public record ProductImageResponse(
        Long id,
        Long productId,
        String url,
        String objectKey,
        String altText,
        Integer sortOrder,
        Boolean isPrimary,
        Instant createdAt
) {
    public static ProductImageResponse from(ProductImage img) {
        return new ProductImageResponse(
                img.getId(),
                img.getProduct().getId(),
                img.getImageUrl(),
                img.getObjectKey(),
                img.getAltText(),
                img.getSortOrder(),
                img.getIsPrimary(),
                img.getCreatedAt()
        );
    }
}
