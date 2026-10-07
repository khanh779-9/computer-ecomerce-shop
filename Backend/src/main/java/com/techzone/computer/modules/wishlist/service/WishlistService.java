package com.techzone.computer.modules.wishlist.service;

import com.techzone.computer.modules.wishlist.dto.WishlistItemResponse;

import java.util.List;

public interface WishlistService {

    List<WishlistItemResponse> getMyWishlist(Long userId);

    WishlistItemResponse add(Long userId, Long productId);

    void remove(Long userId, Long productId);

    void clear(Long userId);
}
