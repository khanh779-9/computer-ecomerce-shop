package com.techzone.computer.modules.wishlist.service;

import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.wishlist.dto.WishlistItemResponse;
import com.techzone.computer.modules.wishlist.entity.Wishlist;
import com.techzone.computer.modules.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepo;
    private final ProductRepository productRepo;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getMyWishlist(Long userId) {
        List<Wishlist> rows = wishlistRepo.findByUserIdOrderByCreatedAtDesc(userId);
        if (rows.isEmpty()) {
            return List.of();
        }

        List<Long> productIds = rows.stream().map(Wishlist::getProductId).toList();
        Map<Long, Product> productsById = productRepo.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        return rows.stream()
                .map(row -> toResponse(row, productsById.get(row.getProductId())))
                .toList();
    }

    @Override
    @Transactional
    public WishlistItemResponse add(Long userId, Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm #" + productId));

        Wishlist row = wishlistRepo.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> wishlistRepo.save(Wishlist.builder()
                        .userId(userId)
                        .productId(productId)
                        .build()));

        return toResponse(row, product);
    }

    @Override
    @Transactional
    public void remove(Long userId, Long productId) {
        wishlistRepo.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional
    public void clear(Long userId) {
        wishlistRepo.deleteByUserId(userId);
    }

    private WishlistItemResponse toResponse(Wishlist row, Product product) {
        ProductResponse productResponse = null;
        if (product != null) {
            String imgUrl = product.getImageUrl();
            if (imgUrl == null || imgUrl.isBlank()) {
                String art = product.getArt() != null ? product.getArt() : "laptop";
                imgUrl = (art.startsWith("/") || art.startsWith("http")) ? art : "/images/products/" + art + ".svg";
            }
            productResponse = new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getBrand(),
                product.getCategory(),
                product.getPrice(),
                product.getOldPrice(),
                product.getRating(),
                product.getReviewCount(),
                product.getSold(),
                product.getStock(),
                product.getArt(),
                product.getTint(),
                imgUrl
            );
        }
        return new WishlistItemResponse(row.getId(), row.getProductId(), productResponse, row.getCreatedAt());
    }
}
