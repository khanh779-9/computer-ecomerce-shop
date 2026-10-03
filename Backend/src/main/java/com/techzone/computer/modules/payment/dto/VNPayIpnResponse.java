package com.techzone.computer.modules.payment.dto;

/**
 * VNPay IPN (Instant Payment Notification) response format.
 * VNPay's server expects exactly these fields: RspCode and Message.
 */
public record VNPayIpnResponse(
    String RspCode,
    String Message
) {
    public static VNPayIpnResponse success() {
        return new VNPayIpnResponse("00", "Confirm Success");
    }

    public static VNPayIpnResponse orderNotFound() {
        return new VNPayIpnResponse("01", "Order not found");
    }

    public static VNPayIpnResponse alreadyConfirmed() {
        return new VNPayIpnResponse("02", "Order already confirmed");
    }

    public static VNPayIpnResponse amountMismatch() {
        return new VNPayIpnResponse("04", "Invalid amount");
    }

    public static VNPayIpnResponse invalidChecksum() {
        return new VNPayIpnResponse("97", "Invalid checksum");
    }

    public static VNPayIpnResponse unknownError() {
        return new VNPayIpnResponse("99", "Unknown error");
    }
}
