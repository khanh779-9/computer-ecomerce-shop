package com.techzone.computer.modules.order.service;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest req, Long userId);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);
    OrderResponse getOrderById(Long id, Long viewerUserId, boolean isAdmin, String phone);
    OrderResponse updateOrderStatus(Long id, String status);
}
