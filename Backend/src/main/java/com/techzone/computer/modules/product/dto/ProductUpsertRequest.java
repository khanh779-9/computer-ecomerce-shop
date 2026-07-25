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
    String tint
) {}
