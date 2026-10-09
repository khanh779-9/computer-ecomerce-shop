package com.techzone.computer.modules.cart.service;

import com.techzone.computer.modules.cart.dto.CartDto;
import com.techzone.computer.modules.cart.dto.CartItemDto;
import com.techzone.computer.modules.cart.entity.Cart;
import com.techzone.computer.modules.cart.entity.CartItem;
import com.techzone.computer.modules.cart.repository.CartRepository;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.user.entity.Customer;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CartDto getCart(Long userId, String sessionId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        return toDto(cart);
    }

    @Override
    @Transactional
    public CartDto addItem(Long userId, String sessionId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId, sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm có ID: " + productId));

        if (product.getStock() != null && product.getStock() <= 0) {
            throw new IllegalArgumentException("Sản phẩm hiện đang tạm hết hàng");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct() != null && i.getProduct().getId().equals(productId))
                .findFirst();

        int qtyToAdd = (quantity != null && quantity > 0) ? quantity : 1;

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = (item.getQuantity() != null ? item.getQuantity() : 0) + qtyToAdd;
            if (product.getStock() != null && newQty > product.getStock()) {
                newQty = product.getStock();
            }
            item.setQuantity(newQty);
        } else {
            if (product.getStock() != null && qtyToAdd > product.getStock()) {
                qtyToAdd = product.getStock();
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(qtyToAdd)
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return toDto(cart);
    }

    @Override
    @Transactional
    public CartDto updateItemQuantity(Long userId, String sessionId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId, sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm"));

        if (quantity == null || quantity <= 0) {
            cart.getItems().removeIf(i -> i.getProduct() != null && i.getProduct().getId().equals(productId));
        } else {
            Optional<CartItem> existing = cart.getItems().stream()
                    .filter(i -> i.getProduct() != null && i.getProduct().getId().equals(productId))
                    .findFirst();

            if (existing.isPresent()) {
                int targetQty = quantity;
                if (product.getStock() != null && targetQty > product.getStock()) {
                    targetQty = product.getStock();
                }
                existing.get().setQuantity(targetQty);
            }
        }

        cart = cartRepository.save(cart);
        return toDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeItem(Long userId, String sessionId, Long productId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        cart.getItems().removeIf(i -> i.getProduct() != null && i.getProduct().getId().equals(productId));
        cart = cartRepository.save(cart);
        return toDto(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId, String sessionId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId, String sessionId) {
        if (userId != null) {
            Optional<Cart> userCart = cartRepository.findByCustomerIdWithItems(userId);
            if (userCart.isPresent()) {
                return userCart.get();
            }

            Customer customer = customerRepository.findById(userId).orElse(null);
            Cart newCart = Cart.builder().customer(customer).build();
            return cartRepository.save(newCart);
        }

        String actualSession = (sessionId != null && !sessionId.isBlank()) ? sessionId : "guest_session";
        return cartRepository.findBySessionIdWithItems(actualSession)
                .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(actualSession).build()));
    }

    private CartDto toDto(Cart cart) {
        List<CartItemDto> items = new ArrayList<>();
        int totalItems = 0;
        long totalPrice = 0L;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                Product p = item.getProduct();
                if (p == null) continue;

                int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                long price = p.getPrice() != null ? p.getPrice() : 0L;
                long itemSubtotal = price * qty;

                totalItems += qty;
                totalPrice += itemSubtotal;

                items.add(CartItemDto.builder()
                        .id(item.getId())
                        .productId(p.getId())
                        .sku(p.getSku())
                        .name(p.getName())
                        .brand(p.getBrand())
                        .category(p.getCategory())
                        .price(price)
                        .oldPrice(p.getOldPrice())
                        .art(p.getArt())
                        .tint(p.getTint())
                        .stock(p.getStock())
                        .quantity(qty)
                        .subtotal(itemSubtotal)
                        .build());
            }
        }

        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getCustomer() != null ? cart.getCustomer().getId() : null)
                .sessionId(cart.getSessionId())
                .items(items)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }
}
