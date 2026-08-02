package com.techzone.computer.modules.order.dto;

import java.io.Serializable;

public record OrderItemResponse(
    Long id,
    Long productId,
    String productName,
    Long unitPrice,
    Integer quantity,
    Long total
) implements Serializable {}
