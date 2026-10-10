package com.techzone.computer.modules.brand.dto;

public record BrandResponse(
        Long id,
        String name,
        String slug,
        Boolean isActive,
        Long productCount,
        Long totalStock,
        Long totalSold
) {
}
