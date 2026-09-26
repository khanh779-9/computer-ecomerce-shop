package com.techzone.computer.modules.cart.controller;

import com.techzone.computer.modules.cart.dto.CartDto;
import com.techzone.computer.modules.cart.dto.CartItemRequest;
import com.techzone.computer.modules.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Endpoints cho giỏ hàng người dùng và khách vãng lai")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Lấy giỏ hàng theo User ID hoặc Session ID")
    public ResponseEntity<CartDto> getCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(cartService.getCart(userId, sessionId));
    }

    @PostMapping("/items")
    @Operation(summary = "Thêm sản phẩm vào giỏ hàng")
    public ResponseEntity<CartDto> addItem(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(userId, sessionId, request.getProductId(), request.getQuantity()));
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Cập nhật số lượng sản phẩm trong giỏ")
    public ResponseEntity<CartDto> updateQuantity(
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, sessionId, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Xóa sản phẩm khỏi giỏ hàng")
    public ResponseEntity<CartDto> removeItem(
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(cartService.removeItem(userId, sessionId, productId));
    }

    @DeleteMapping
    @Operation(summary = "Xóa sạch toàn bộ giỏ hàng")
    public ResponseEntity<Void> clearCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId) {
        cartService.clearCart(userId, sessionId);
        return ResponseEntity.noContent().build();
    }
}
