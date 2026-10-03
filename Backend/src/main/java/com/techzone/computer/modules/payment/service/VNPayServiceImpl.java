package com.techzone.computer.modules.payment.service;

import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.service.OrderService;
import com.techzone.computer.modules.payment.config.VNPayConfig;
import com.techzone.computer.modules.payment.dto.VNPayCallbackResponse;
import com.techzone.computer.modules.payment.dto.VNPayPaymentRequest;
import com.techzone.computer.modules.payment.dto.VNPayPaymentResponse;
import com.techzone.computer.modules.payment.util.VNPayUtil;
import com.techzone.computer.modules.payment.dto.VNPayIpnResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final OrderService orderService;

    @Override
    public VNPayPaymentResponse createPaymentUrl(VNPayPaymentRequest req, HttpServletRequest request) {
        OrderResponse order = orderService.getOrderById(req.orderId());
        long vnpAmount = order.total() * 100L;

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", "VND");

        if (req.bankCode() != null && !req.bankCode().isBlank()) {
            vnpParams.put("vnp_BankCode", req.bankCode().trim());
        }

        // Tạo mã tham chiếu giao dịch: [orderId]_[timestamp]
        String txnRef = order.id() + "_" + System.currentTimeMillis();
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang #" + order.id() + " tai TechZone Computer");
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());

        // Lấy địa chỉ IP người gửi
        String clientIp = extractIpAddress(request);
        vnpParams.put("vnp_IpAddr", clientIp);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        // Hạn thanh toán 15 phút
        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        String queryUrl = VNPayUtil.buildQueryUrl(vnpParams);
        String vnpSecureHash = VNPayUtil.hashAllFields(vnpParams, vnPayConfig.getHashSecret());
        String paymentUrl = vnPayConfig.getUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnpSecureHash;

        return new VNPayPaymentResponse("SUCCESS", "Khởi tạo URL thanh toán VNPay thành công", paymentUrl);
    }

    @Override
    public VNPayCallbackResponse processCallback(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null || vnpSecureHash.isBlank()) {
            return new VNPayCallbackResponse("INVALID_HASH", "Thiếu chữ ký bảo mật vnp_SecureHash", null, null, null, null, null);
        }

        Map<String, String> hashFields = extractHashFields(params);
        String calculatedHash = VNPayUtil.hashAllFields(hashFields, vnPayConfig.getHashSecret());
        if (!constantTimeEquals(calculatedHash, vnpSecureHash)) {
            log.warn("VNPay callback rejected: checksum mismatch for vnp_TxnRef={}", params.get("vnp_TxnRef"));
            return new VNPayCallbackResponse("INVALID_HASH", "Chữ ký bảo mật không khớp (Invalid Checksum)", null, null, null, null, null);
        }

        String txnRef = params.get("vnp_TxnRef");
        Long orderId = parseTxnRefOrderId(txnRef);
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        Long amount = parseVnpAmount(params.get("vnp_Amount"));

        if ("00".equals(responseCode)) {
            if (orderId == null) {
                return new VNPayCallbackResponse("SUCCESS", "Giao dịch thanh toán qua VNPay thành công", null, transactionNo, bankCode, amount, responseCode);
            }

            OrderResponse order;
            try {
                order = orderService.getOrderById(orderId);
            } catch (NoSuchElementException e) {
                log.error("VNPay callback: order not found for orderId={}", orderId);
                return new VNPayCallbackResponse("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng tương ứng với giao dịch #" + orderId, orderId, transactionNo, bankCode, amount, responseCode);
            }

            if (amount != null && !amount.equals(order.total())) {
                log.error("VNPay callback: amount mismatch for orderId={} (expected {}, received {})", orderId, order.total(), amount);
                return new VNPayCallbackResponse("AMOUNT_MISMATCH", "Số tiền giao dịch không khớp với đơn hàng #" + orderId, orderId, transactionNo, bankCode, amount, responseCode);
            }

            if (!"PAID".equals(order.status())) {
                orderService.updateOrderStatus(orderId, "PAID");
            }
            return new VNPayCallbackResponse("SUCCESS", "Giao dịch thanh toán qua VNPay thành công", orderId, transactionNo, bankCode, amount, responseCode);
        } else {
            return new VNPayCallbackResponse("FAILED", "Giao dịch không thành công hoặc bị người dùng hủy bỏ (Mã lỗi: " + responseCode + ")", orderId, transactionNo, bankCode, amount, responseCode);
        }
    }

    /**
     * Xử lý VNPay IPN (Instant Payment Notification) — Server-to-Server webhook.
     * VNPay gọi trực tiếp endpoint này mà không qua trình duyệt người dùng.
     * Đảm bảo idempotency: nếu đơn đã PAID, trả về "02" (already confirmed).
     */
    @Override
    public VNPayIpnResponse processIpn(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            if (vnpSecureHash == null || vnpSecureHash.isBlank()) {
                return VNPayIpnResponse.invalidChecksum();
            }

            Map<String, String> hashFields = extractHashFields(params);
            String calculatedHash = VNPayUtil.hashAllFields(hashFields, vnPayConfig.getHashSecret());
            if (!constantTimeEquals(calculatedHash, vnpSecureHash)) {
                log.warn("VNPay IPN rejected: checksum mismatch for vnp_TxnRef={}", params.get("vnp_TxnRef"));
                return VNPayIpnResponse.invalidChecksum();
            }

            String txnRef = params.get("vnp_TxnRef");
            Long orderId = parseTxnRefOrderId(txnRef);
            if (orderId == null) {
                log.warn("VNPay IPN: cannot parse orderId from vnp_TxnRef={}", txnRef);
                return VNPayIpnResponse.orderNotFound();
            }

            OrderResponse order;
            try {
                order = orderService.getOrderById(orderId);
            } catch (NoSuchElementException e) {
                log.error("VNPay IPN: order not found for orderId={}", orderId);
                return VNPayIpnResponse.orderNotFound();
            }

            // Idempotency: đơn đã thanh toán rồi thì không xử lý lại
            if ("PAID".equals(order.status())) {
                log.info("VNPay IPN: order #{} already PAID, skipping", orderId);
                return VNPayIpnResponse.alreadyConfirmed();
            }

            Long amount = parseVnpAmount(params.get("vnp_Amount"));
            if (amount != null && !amount.equals(order.total())) {
                log.error("VNPay IPN: amount mismatch for orderId={} (expected {}, received {})", orderId, order.total(), amount);
                return VNPayIpnResponse.amountMismatch();
            }

            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                orderService.updateOrderStatus(orderId, "PAID");
                log.info("VNPay IPN: order #{} marked as PAID successfully", orderId);
                return VNPayIpnResponse.success();
            } else {
                log.info("VNPay IPN: transaction failed for order #{}, responseCode={}", orderId, responseCode);
                return VNPayIpnResponse.success(); // Acknowledge receipt even for failed transactions
            }
        } catch (Exception e) {
            log.error("VNPay IPN: unexpected error", e);
            return VNPayIpnResponse.unknownError();
        }
    }

    // ─── Private Helpers ────────────────────────────────────────────────

    private Map<String, String> extractHashFields(Map<String, String> params) {
        Map<String, String> hashFields = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getKey().startsWith("vnp_")
                    && !entry.getKey().equals("vnp_SecureHash")
                    && !entry.getKey().equals("vnp_SecureHashType")
                    && entry.getValue() != null && !entry.getValue().isBlank()) {
                hashFields.put(entry.getKey(), entry.getValue());
            }
        }
        return hashFields;
    }

    private Long parseTxnRefOrderId(String txnRef) {
        if (txnRef == null) return null;
        String[] parts = txnRef.split("_");
        try {
            return Long.parseLong(parts[0]);
        } catch (NumberFormatException e) {
            log.warn("VNPay: unparseable vnp_TxnRef={}", txnRef);
            return null;
        }
    }

    private Long parseVnpAmount(String vnpAmountStr) {
        if (vnpAmountStr == null) return null;
        try {
            return Long.parseLong(vnpAmountStr) / 100L;
        } catch (NumberFormatException e) {
            log.warn("VNPay: unparseable vnp_Amount={}", vnpAmountStr);
            return null;
        }
    }

    private boolean constantTimeEquals(String expected, String received) {
        if (expected == null || received == null) {
            return false;
        }
        return MessageDigest.isEqual(
                expected.toLowerCase().getBytes(StandardCharsets.UTF_8),
                received.toLowerCase().getBytes(StandardCharsets.UTF_8)
        );
    }

    private String extractIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        return (ipAddress != null && !ipAddress.isBlank()) ? ipAddress : "127.0.0.1";
    }
}

