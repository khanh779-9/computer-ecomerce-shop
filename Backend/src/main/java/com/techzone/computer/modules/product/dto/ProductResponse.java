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
    String tint,
    String imageUrl
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
            (art != null && (art.startsWith("/") || art.startsWith("http"))) ? art : "/images/products/" + (art != null ? art : "laptop") + ".svg"
        );
    }
}

