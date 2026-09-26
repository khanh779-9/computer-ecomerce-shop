package com.techzone.computer.modules.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private Long userId;
    private String sessionId;
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    private Integer totalItems;
    private Long totalPrice;
}
