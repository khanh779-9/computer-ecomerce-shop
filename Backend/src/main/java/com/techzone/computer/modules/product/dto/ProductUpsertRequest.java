package com.techzone.computer.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductUpsertRequest(
    String sku,
    @NotBlank String name,
    String brand,
    @NotBlank String category,
    @NotNull @Positive Long price,
    Long oldPrice,
    Double rating,
    Integer reviewCount,
    Integer sold,
    Integer stock,
    String art,
    String tint,
    String imageUrl,
    String description,
    Long brandId,
    Long categoryId,
    Long manufacturerId,
    String specifications,
    Integer warrantyMonths,
    Boolean active,
    java.time.Instant publishedAt
) {
    public ProductUpsertRequest(
        String sku,
        String name,
        String brand,
        String category,
        Long price,
        Long oldPrice,
        Double rating,
        Integer reviewCount,
        Integer sold,
        Integer stock,
        String art,
        String tint
    ) {
        this(sku, name, brand, category, price, oldPrice, rating, reviewCount, sold, stock, art, tint, null, null, null, null, null, null, null, null, null);
    }
}
