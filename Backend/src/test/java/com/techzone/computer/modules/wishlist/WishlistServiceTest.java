package com.techzone.computer.modules.wishlist;

import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.wishlist.entity.Wishlist;
import com.techzone.computer.modules.wishlist.repository.WishlistRepository;
import com.techzone.computer.modules.wishlist.service.WishlistServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {
    @Mock WishlistRepository wishlistRepository;
    @Mock ProductRepository productRepository;

    @Test void addDoesNotCreateDuplicateRow() {
        Wishlist row = Wishlist.builder().id(2L).userId(1L).productId(3L).build();
        when(productRepository.findById(3L)).thenReturn(Optional.of(product(3L)));
        when(wishlistRepository.findByUserIdAndProductId(1L, 3L)).thenReturn(Optional.of(row));

        var result = new WishlistServiceImpl(wishlistRepository, productRepository).add(1L, 3L);

        assertEquals(2L, result.id());
        verify(wishlistRepository, never()).save(any());
    }

    @Test void addRejectsUnknownProduct() {
        when(productRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> new WishlistServiceImpl(wishlistRepository, productRepository).add(1L, 9L));
    }

    @Test void removeAndClearDelegateToRepository() {
        WishlistServiceImpl service = new WishlistServiceImpl(wishlistRepository, productRepository);

        service.remove(1L, 2L);
        service.clear(1L);

        verify(wishlistRepository).deleteByUserIdAndProductId(1L, 2L);
        verify(wishlistRepository).deleteByUserId(1L);
    }

    private Product product(Long id) {
        return Product.builder().id(id).sku("SKU").name("Keyboard").price(200000L)
                .stock(3).art("keyboard").build();
    }
}
