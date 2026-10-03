package com.techzone.computer.modules.payment.dto;

public record VNPayPaymentResponse(
    String status,
    String message,
    String paymentUrl
) {}
