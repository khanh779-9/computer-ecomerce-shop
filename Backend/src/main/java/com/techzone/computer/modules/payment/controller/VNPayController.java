package com.techzone.computer.modules.payment.controller;

import com.techzone.computer.modules.payment.dto.VNPayCallbackResponse;
import com.techzone.computer.modules.payment.dto.VNPayPaymentRequest;
import com.techzone.computer.modules.payment.dto.VNPayPaymentResponse;
import com.techzone.computer.modules.payment.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
public class VNPayController {

    private final VNPayService vnPayService;

    public VNPayController(VNPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    @PostMapping("/create-payment")
    public VNPayPaymentResponse createPayment(
            @Valid @RequestBody VNPayPaymentRequest req,
            HttpServletRequest request
    ) {
        return vnPayService.createPaymentUrl(req, request);
    }

    @GetMapping("/create-payment/{orderId}")
    public VNPayPaymentResponse createPaymentForOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request
    ) {
        VNPayPaymentRequest req = new VNPayPaymentRequest(orderId, bankCode);
        return vnPayService.createPaymentUrl(req, request);
    }

    @GetMapping("/callback")
    public VNPayCallbackResponse handleCallback(@RequestParam Map<String, String> params) {
        return vnPayService.processCallback(params);
    }

    @GetMapping({"/ipn", "/vnpay-ipn"})
    public com.techzone.computer.modules.payment.dto.VNPayIpnResponse handleIpn(@RequestParam Map<String, String> params) {
        return vnPayService.processIpn(params);
    }
}
