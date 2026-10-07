package com.techzone.computer.modules.wishlist.controller;

import com.techzone.computer.modules.wishlist.dto.WishlistItemResponse;
import com.techzone.computer.modules.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Endpoints quản lý danh sách sản phẩm yêu thích (đồng bộ theo tài khoản)")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sản phẩm yêu thích của tôi")
    public List<WishlistItemResponse> getMyWishlist(@AuthenticationPrincipal Jwt jwt) {
        Long userId = requireUserId(jwt);
        return wishlistService.getMyWishlist(userId);
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Thêm sản phẩm vào danh sách yêu thích (idempotent)")
    public WishlistItemResponse add(@PathVariable Long productId, @AuthenticationPrincipal Jwt jwt) {
        Long userId = requireUserId(jwt);
        return wishlistService.add(userId, productId);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Gỡ sản phẩm khỏi danh sách yêu thích")
    public void remove(@PathVariable Long productId, @AuthenticationPrincipal Jwt jwt) {
        Long userId = requireUserId(jwt);
        wishlistService.remove(userId, productId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Xóa toàn bộ danh sách yêu thích")
    public void clear(@AuthenticationPrincipal Jwt jwt) {
        Long userId = requireUserId(jwt);
        wishlistService.clear(userId);
    }

    private Long requireUserId(Jwt jwt) {
        if (jwt == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để sử dụng danh sách yêu thích");
        }
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token không hợp lệ");
        }
    }
}
