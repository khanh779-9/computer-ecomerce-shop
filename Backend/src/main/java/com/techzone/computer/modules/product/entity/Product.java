package com.techzone.computer.modules.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String category;

    @Column(name = "brand_id")
    private Long brandId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "manufacturer_id")
    private Long manufacturerId;

    @Column(nullable = false)
    private Long price;

    @Column(name = "old_price")
    private Long oldPrice;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Builder.Default
    private Integer sold = 0;

    @Builder.Default
    private Integer stock = 0;

    @Column(length = 50)
    private String art;

    @Column(length = 30)
    private String tint;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "jsonb")
    private String specifications;

    @Column(name = "warranty_months")
    private Integer warrantyMonths;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
