package com.techzone.computer.modules.cart;

import com.techzone.computer.modules.cart.entity.Cart;
import com.techzone.computer.modules.cart.entity.CartItem;
import com.techzone.computer.modules.cart.repository.CartRepository;
import com.techzone.computer.modules.cart.service.CartServiceImpl;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {
    @Mock CartRepository cartRepository;
    @Mock ProductRepository productRepository;
    @Mock CustomerRepository customerRepository;
    private CartServiceImpl service;

    @BeforeEach void setUp() {
        service = new CartServiceImpl(cartRepository, productRepository, customerRepository);
    }

    @Test void addItemCreatesGuestCartAndCalculatesTotals() {
        Cart cart = Cart.builder().sessionId("s1").build();
        Product product = product(5);
        when(cartRepository.findBySessionIdWithItems("s1")).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.save(cart)).thenReturn(cart);

        var result = service.addItem(null, "s1", 1L, 2);

        assertEquals(2, result.getTotalItems());
        assertEquals(200000L, result.getTotalPrice());
        assertEquals(2, cart.getItems().get(0).getQuantity());
    }

    @Test void addItemCapsQuantityAtStock() {
        Cart cart = Cart.builder().sessionId("s1").build();
        when(cartRepository.findBySessionIdWithItems("s1")).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product(2)));
        when(cartRepository.save(cart)).thenReturn(cart);

        service.addItem(null, "s1", 1L, 10);

        assertEquals(2, cart.getItems().get(0).getQuantity());
    }

    @Test void addItemRejectsOutOfStockProduct() {
        Cart cart = Cart.builder().sessionId("s1").build();
        when(cartRepository.findBySessionIdWithItems("s1")).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product(0)));

        assertThrows(IllegalArgumentException.class, () -> service.addItem(null, "s1", 1L, 1));
        verify(cartRepository, never()).save(cart);
    }

    @Test void updateQuantityAtZeroRemovesItem() {
        Product product = product(5);
        Cart cart = Cart.builder().sessionId("s1").build();
        cart.getItems().add(CartItem.builder().cart(cart).product(product).quantity(2).build());
        when(cartRepository.findBySessionIdWithItems("s1")).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.save(cart)).thenReturn(cart);

        service.updateItemQuantity(null, "s1", 1L, 0);

        assertTrue(cart.getItems().isEmpty());
    }

    private Product product(int stock) {
        return Product.builder().id(1L).sku("SKU").name("Mouse").price(100000L)
                .stock(stock).build();
    }
}
