package com.techzone.computer.modules.cart.service;

import com.techzone.computer.modules.cart.dto.CartDto;

public interface CartService {
    CartDto getCart(Long userId, String sessionId);
    CartDto addItem(Long userId, String sessionId, Long productId, Integer quantity);
    CartDto updateItemQuantity(Long userId, String sessionId, Long productId, Integer quantity);
    CartDto removeItem(Long userId, String sessionId, Long productId);
    void clearCart(Long userId, String sessionId);
}
