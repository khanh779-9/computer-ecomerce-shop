package com.techzone.computer.modules.product.dto;

import java.io.Serializable;
import java.time.Instant;

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
    String tint,
    String imageUrl,
    String description,
    Instant createdAt,
    Long brandId,
    Long categoryId,
    Long manufacturerId,
    String specifications,
    Integer warrantyMonths,
    Boolean active,
    Instant publishedAt
) implements Serializable {

    public ProductResponse(
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
    ) {
        this(
            id,
            sku,
            name,
            brand,
            category,
            price,
            oldPrice,
            rating,
            reviewCount,
            sold,
            stock,
            art,
            tint,
            (art != null && (art.startsWith("/") || art.startsWith("http"))) ? art : "/images/products/" + (art != null ? art : "laptop") + ".svg",
            null,
            null, null, null, null, null, null, null, null
        );
    }

    public ProductResponse(
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
        String tint,
        String imageUrl,
        String description
    ) {
        this(id, sku, name, brand, category, price, oldPrice, rating, reviewCount, sold, stock, art, tint, imageUrl, description, null, null, null, null, null, null, null, null);
    }
}
