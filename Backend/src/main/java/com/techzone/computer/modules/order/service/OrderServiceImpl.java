package com.techzone.computer.modules.order.service;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderItemRequest;
import com.techzone.computer.modules.order.dto.OrderItemResponse;
import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.entity.OrderItem;
import com.techzone.computer.modules.order.entity.OrderStatus;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.order.util.OrderTotals;
import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.service.ProductService;
import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.service.VoucherService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final VoucherService voucherService;

    public OrderServiceImpl(OrderRepository orderRepository, ProductService productService, VoucherService voucherService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.voucherService = voucherService;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req) {
        Order order = new Order();
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
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng ID: " + id));
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
        return mapToResponse(orderRepository.save(order));
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
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
