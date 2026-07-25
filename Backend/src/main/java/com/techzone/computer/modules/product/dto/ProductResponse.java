package com.techzone.computer.modules.product.dto;

import java.io.Serializable;

public record ProductResponse(
    Long id,
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
) implements Serializable {}

