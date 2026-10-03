package com.techzone.computer.modules.payment.service;

import com.techzone.computer.modules.payment.dto.VNPayCallbackResponse;
import com.techzone.computer.modules.payment.dto.VNPayIpnResponse;
import com.techzone.computer.modules.payment.dto.VNPayPaymentRequest;
import com.techzone.computer.modules.payment.dto.VNPayPaymentResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VNPayService {
    VNPayPaymentResponse createPaymentUrl(VNPayPaymentRequest req, HttpServletRequest request);
    VNPayCallbackResponse processCallback(Map<String, String> params);
    VNPayIpnResponse processIpn(Map<String, String> params);
}

