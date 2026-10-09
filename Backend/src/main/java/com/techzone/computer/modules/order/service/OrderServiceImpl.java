package com.techzone.computer.modules.order.service;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderItemRequest;
import com.techzone.computer.modules.order.dto.OrderItemResponse;
import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.entity.OrderItem;
import com.techzone.computer.modules.order.entity.OrderStatus;
import com.techzone.computer.modules.order.repository.OrderItemRepository;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.order.util.OrderTotals;
import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.service.ProductService;
import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.service.VoucherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductService productService;
    private final VoucherService voucherService;

    public OrderServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                            ProductService productService, VoucherService voucherService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productService = productService;
        this.voucherService = voucherService;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req, Long userId) {
        Order order = new Order();
        order.setUserId(userId);
        order.setRecipientName(req.recipientName());
        order.setPhone(req.phone());
        order.setAddress(req.address());
        order.setNote(req.note());
        order.setPaymentMethod(req.paymentMethod());
        order.setStatus(OrderStatus.PENDING);

        long subtotal = 0L;

        for (OrderItemRequest itemReq : req.items()) {
            ProductResponse product = productService.deductStock(itemReq.productId(), itemReq.quantity());

            OrderItem item = new OrderItem();
            item.setProductId(product.id());
            item.setProductName(product.name());
            item.setUnitPrice(product.price());
            item.setQuantity(itemReq.quantity());

            order.addItem(item);
            subtotal += product.price() * itemReq.quantity();
        }

        long discountAmount = 0L;
        boolean freeShip = false;

        if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
            VoucherValidationResult voucher = voucherService.validate(req.voucherCode().trim(), subtotal);
            if (!voucher.isValid()) {
                throw new IllegalArgumentException(voucher.getMessage());
            }
            discountAmount = voucher.getDiscountAmount() != null ? voucher.getDiscountAmount() : 0L;
            freeShip = Boolean.TRUE.equals(voucher.getIsFreeShip());
            order.setVoucherCode(voucher.getCode());
        }

        long shippingFee = freeShip ? 0L : OrderTotals.shippingFee(subtotal);
        long total = Math.max(0L, subtotal - Math.min(discountAmount, subtotal)) + shippingFee;

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotal(total);

        Order saved = orderRepository.save(order);
        return toResponse(saved, saved.getItems());
    }

    public OrderResponse createOrder(CreateOrderRequest req) {
        return createOrder(req, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return toPage(orderRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return toPage(orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, Long viewerUserId, boolean isAdmin, String phone) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng ID: " + id));
        boolean isOwner = viewerUserId != null && viewerUserId.equals(order.getUserId());
        boolean phoneMatches = phone != null && !phone.isBlank() && phone.trim().equals(order.getPhone());
        if (!isOwner && !isAdmin && !phoneMatches) {
            throw new NoSuchElementException("Không tìm thấy đơn hàng ID: " + id);
        }
        return toResponse(order, order.getItems());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng ID: " + id));
        return toResponse(order, order.getItems());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng ID: " + id));
        OrderStatus statusEnum;
        try {
            statusEnum = OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }
        order.setStatus(statusEnum);
        return toResponse(orderRepository.save(order), order.getItems());
    }

    private Page<OrderResponse> toPage(Page<Order> page) {
        List<Long> orderIds = page.map(Order::getId).getContent();
        Map<Long, List<OrderItem>> itemsByOrderId = orderItemRepository.findByOrder_IdIn(orderIds)
                .stream()
                .collect(Collectors.groupingBy(i -> i.getOrder().getId()));
        return page.map(order -> toResponse(order, itemsByOrderId.getOrDefault(order.getId(), List.of())));
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(i -> new OrderItemResponse(
                        i.getId(),
                        i.getProductId(),
                        i.getProductName(),
                        i.getUnitPrice(),
                        i.getQuantity(),
                        i.getUnitPrice() * i.getQuantity()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getPaymentMethod(),
                order.getRecipientName(),
                order.getPhone(),
                order.getAddress(),
                order.getNote(),
                order.getVoucherCode(),
                order.getDiscountAmount(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotal(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}
