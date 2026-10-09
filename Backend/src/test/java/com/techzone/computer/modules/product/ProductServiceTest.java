package com.techzone.computer.modules.product;

import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.product.service.ProductImageService;
import com.techzone.computer.modules.product.service.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageService productImageService;

    private ProductServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ProductServiceImpl(productRepository, productImageService);
    }

    @Test
    void deductStockUpdatesStockAndSoldCount() {
        Product product = product(10, 4);
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(product);

        var response = service.deductStock(1L, 3);

        assertEquals(7, response.stock());
        assertEquals(7, response.sold());
        verify(productRepository).save(product);
    }

    @Test
    void deductStockRejectsQuantityAboveAvailableStock() {
        Product product = product(2, 4);
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.deductStock(1L, 3)
        );

        assertTrue(exception.getMessage().contains("không đủ số lượng tồn kho"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void getRejectsUnknownProduct() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows( java.util.NoSuchElementException.class, () -> service.get(999L));
    }

    private Product product(int stock, int sold) {
        return Product.builder()
                .id(1L)
                .sku("SKU-1")
                .name("Laptop")
                .brand("Test")
                .category("Laptop")
                .price(100000L)
                .oldPrice(120000L)
                .stock(stock)
                .sold(sold)
                .art("laptop")
                .tint("#fff")
                .build();
    }
}
