package com.techzone.computer.modules.wishlist.dto;

import com.techzone.computer.modules.product.dto.ProductResponse;

import java.time.Instant;

public record WishlistItemResponse(
    Long id,
    Long productId,
    ProductResponse product,
    Instant createdAt
) {}
