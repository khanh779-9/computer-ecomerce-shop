package com.techzone.computer.modules.order.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    String status,
    String paymentMethod,
    String recipientName,
    String phone,
    String address,
    String note,
    Long subtotal,
    Long shippingFee,
    Long total,
    Instant createdAt,
    List<OrderItemResponse> items
) implements Serializable {}
