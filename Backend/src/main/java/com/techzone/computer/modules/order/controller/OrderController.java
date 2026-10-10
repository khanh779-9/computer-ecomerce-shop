package com.techzone.computer.modules.order.controller;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.dto.UpdateOrderStatusRequest;
import com.techzone.computer.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest req,
                                     @AuthenticationPrincipal Jwt jwt) {
        return orderService.createOrder(req, userIdFrom(jwt));
    }

    @GetMapping
    public Page<OrderResponse> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/my-orders")
    public Page<OrderResponse> getMyOrders(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = requireUserId(jwt);
        return orderService.getMyOrders(userId, pageable);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable Long id,
                                      @AuthenticationPrincipal Jwt jwt,
                                      @RequestParam(required = false) String phone) {
        return orderService.getOrderById(id, userIdFrom(jwt), isAdmin(jwt), phone);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateOrderStatus(@PathVariable Long id,
                                           @Valid @RequestBody UpdateOrderStatusRequest body) {
        return orderService.updateOrderStatus(id, body.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    private Long userIdFrom(Jwt jwt) {
        if (jwt == null) return null;
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long requireUserId(Jwt jwt) {
        Long userId = userIdFrom(jwt);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để xem đơn hàng của bạn");
        }
        return userId;
    }

    private boolean isAdmin(Jwt jwt) {
        return jwt != null && "ADMIN".equals(jwt.getClaimAsString("role"));
    }
}
