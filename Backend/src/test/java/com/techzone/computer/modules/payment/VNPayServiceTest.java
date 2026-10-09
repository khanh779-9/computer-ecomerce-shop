package com.techzone.computer.modules.payment;

import com.techzone.computer.modules.order.dto.OrderResponse;
import com.techzone.computer.modules.order.service.OrderService;
import com.techzone.computer.modules.payment.config.VNPayConfig;
import com.techzone.computer.modules.payment.dto.VNPayCallbackResponse;
import com.techzone.computer.modules.payment.dto.VNPayIpnResponse;
import com.techzone.computer.modules.payment.service.VNPayServiceImpl;
import com.techzone.computer.modules.payment.util.VNPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VNPayServiceTest {

    private static final String SECRET = "test-secret";

    @Mock
    private OrderService orderService;

    private VNPayServiceImpl service;

    @BeforeEach
    void setUp() {
        VNPayConfig config = new VNPayConfig();
        config.setHashSecret(SECRET);
        service = new VNPayServiceImpl(config, orderService);
    }

    @Test
    void callbackRejectsMissingSignature() {
        VNPayCallbackResponse response = service.processCallback(Map.of("vnp_TxnRef", "100_123"));

        assertEquals("INVALID_HASH", response.status());
        verifyNoInteractions(orderService);
    }

    @Test
    void callbackRejectsInvalidSignature() {
        Map<String, String> params = signedParams("100_123", "00", "33000000");
        params.put("vnp_SecureHash", "invalid");

        VNPayCallbackResponse response = service.processCallback(params);

        assertEquals("INVALID_HASH", response.status());
        verifyNoInteractions(orderService);
    }

    @Test
    void callbackMarksOrderPaidWhenAmountMatches() {
        Map<String, String> params = signedParams("100_123", "00", "33000000");
        when(orderService.getOrderById(100L)).thenReturn(order(100L, "PENDING", 330000L));

        VNPayCallbackResponse response = service.processCallback(params);

        assertEquals("SUCCESS", response.status());
        assertEquals(100L, response.orderId());
        verify(orderService).updateOrderStatus(100L, "PAID");
    }

    @Test
    void callbackRejectsAmountMismatch() {
        Map<String, String> params = signedParams("100_123", "00", "33000000");
        when(orderService.getOrderById(100L)).thenReturn(order(100L, "PENDING", 300000L));

        VNPayCallbackResponse response = service.processCallback(params);

        assertEquals("AMOUNT_MISMATCH", response.status());
        verify(orderService, never()).updateOrderStatus(anyLong(), anyString());
    }

    @Test
    void callbackReportsMissingOrder() {
        Map<String, String> params = signedParams("100_123", "00", "33000000");
        when(orderService.getOrderById(100L)).thenThrow(new NoSuchElementException());

        VNPayCallbackResponse response = service.processCallback(params);

        assertEquals("ORDER_NOT_FOUND", response.status());
    }

    @Test
    void ipnIsIdempotentForAlreadyPaidOrder() {
        Map<String, String> params = signedParams("100_123", "00", "33000000");
        when(orderService.getOrderById(100L)).thenReturn(order(100L, "PAID", 330000L));

        VNPayIpnResponse response = service.processIpn(params);

        assertEquals("02", response.RspCode());
        verify(orderService, never()).updateOrderStatus(anyLong(), anyString());
    }

    private Map<String, String> signedParams(String txnRef, String responseCode, String amount) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_Amount", amount);
        params.put("vnp_TransactionNo", "987654");
        params.put("vnp_SecureHash", VNPayUtil.hashAllFields(params, SECRET));
        return params;
    }

    private OrderResponse order(Long id, String status, Long total) {
        return new OrderResponse(
                id, status, "VNPay", "Nguyen Van A", "0900000000",
                "Address", null, null, 0L, total, 0L, total,
                null, java.util.List.of()
        );
    }
}
