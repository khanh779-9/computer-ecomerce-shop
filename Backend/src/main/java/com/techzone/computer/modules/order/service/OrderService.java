package com.techzone.computer.modules.order.service;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest req, Long userId);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);
    /**
     * Loads an order for trusted internal integrations such as payment callbacks.
     * Unlike the HTTP-facing overload, this method does not apply viewer access checks.
     */
    OrderResponse getOrderById(Long id);
    OrderResponse getOrderById(Long id, Long viewerUserId, boolean isAdmin, String phone);
    OrderResponse updateOrderStatus(Long id, String status);

    /**
     * [Admin] Xóa đơn đã hủy khỏi hệ thống và hoàn lại tồn kho cho từng sản phẩm.
     */
    void deleteOrder(Long id);
}
