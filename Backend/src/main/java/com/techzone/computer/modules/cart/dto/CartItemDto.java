package com.techzone.computer.modules.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private String sku;
    private String name;
    private String brand;
    private String category;
    private Long price;
    private Long oldPrice;
    private String art;
    private String tint;
    private Integer stock;
    private Integer quantity;
    private Long subtotal;
}
