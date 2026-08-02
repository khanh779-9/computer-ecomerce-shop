package com.techzone.computer.modules.order;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderItemRequest;
import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.order.service.OrderServiceImpl;
import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void createOrderSuccess_callsProductServiceAndCalculatesTotal() {
        ProductResponse mockProduct = new ProductResponse(
                1L, "MT-LT-001", "Laptop Asus Vivobook 15", "Asus", "Laptop",
                13490000L, 15990000L, 4.7, 86, 214, 4, "laptop", "#c7d2fe"
        );

        when(productService.deductStock(1L, 2)).thenReturn(mockProduct);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1001L);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                "Tráº§n VÄƒn Minh",
                "0912345678",
                "123 Nguyá»…n Huá»‡, TP.HCM",
                "Giao sá»›m",
                "COD",
                List.of(new OrderItemRequest(1L, 2))
        );

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(1001L, response.id());
        assertEquals("PENDING", response.status());
        assertEquals(26980000L, response.subtotal());
        assertEquals(0L, response.shippingFee()); // >= 500k is free shipping
        assertEquals(26980000L, response.total());

        // Verify Order module communicates cleanly via ProductService
        verify(productService).deductStock(1L, 2);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_throwsExceptionWhenStockShortage() {
        when(productService.deductStock(1L, 10))
                .thenThrow(new IllegalStateException("Sáº£n pháº©m khÃ´ng Ä‘á»§ sá»‘ lÆ°á»£ng tá»“n kho"));

        CreateOrderRequest request = new CreateOrderRequest(
                "Tráº§n VÄƒn Minh",
                "0912345678",
                "123 Nguyá»…n Huá»‡, TP.HCM",
                "",
                "COD",
                List.of(new OrderItemRequest(1L, 10))
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> orderService.createOrder(request));
        assertTrue(ex.getMessage().contains("khÃ´ng Ä‘á»§ sá»‘ lÆ°á»£ng tá»“n kho"));
        verify(orderRepository, never()).save(any());
    }
}
