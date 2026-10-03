package com.techzone.computer.modules.payment.dto;

public record VNPayCallbackResponse(
    String status,
    String message,
    Long orderId,
    String transactionNo,
    String bankCode,
    Long amount,
    String responseCode
) {}
