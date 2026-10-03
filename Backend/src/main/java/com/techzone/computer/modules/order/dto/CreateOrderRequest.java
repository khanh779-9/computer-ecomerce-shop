package com.techzone.computer.modules.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank String recipientName,
    @NotBlank String phone,
    @NotBlank String address,
    String note,
    String voucherCode,
    @NotBlank String paymentMethod,
    @NotEmpty @Valid List<OrderItemRequest> items
) {}
