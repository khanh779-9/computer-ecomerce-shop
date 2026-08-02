package com.techzone.computer.modules.order.service;

import com.techzone.computer.modules.order.dto.CreateOrderRequest;
import com.techzone.computer.modules.order.dto.OrderItemRequest;
import com.techzone.computer.modules.order.dto.OrderItemResponse;
import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.entity.OrderItem;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.order.util.OrderTotals;
import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;

    public OrderServiceImpl(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
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
        order.setStatus("PENDING");

        long subtotal = 0L;

        for (OrderItemRequest itemReq : req.items()) {
            // Giao tiáº¿p qua ProductService cÃ´ng khai thay vÃ¬ cháº¡m trá»±c tiáº¿p vÃ o repository cá»§a module khÃ¡c
            ProductResponse product = productService.deductStock(itemReq.productId(), itemReq.quantity());

            OrderItem item = new OrderItem();
            item.setProductId(product.id());
            item.setProductName(product.name());
            item.setUnitPrice(product.price());
            item.setQuantity(itemReq.quantity());

            order.addItem(item);
            subtotal += product.price() * itemReq.quantity();
        }

        long total = OrderTotals.calculate(subtotal);
        long shippingFee = total - subtotal;

        order.setSubtotal(subtotal);
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
                .orElseThrow(() -> new NoSuchElementException("KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng ID: " + id));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng ID: " + id));
        order.setStatus(status.toUpperCase());
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
                order.getStatus(),
                order.getPaymentMethod(),
                order.getRecipientName(),
                order.getPhone(),
                order.getAddress(),
                order.getNote(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotal(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}
