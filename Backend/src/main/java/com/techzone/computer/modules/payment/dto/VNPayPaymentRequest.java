package com.techzone.computer.modules.payment.dto;

import jakarta.validation.constraints.NotNull;

public record VNPayPaymentRequest(
    @NotNull(message = "orderId không được để trống")
    Long orderId,
    String bankCode
) {}
