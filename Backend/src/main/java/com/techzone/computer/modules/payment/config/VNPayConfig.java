package com.techzone.computer.modules.payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VNPayConfig {
    private String tmnCode = "2QXUI4B4";
    private String hashSecret = "RAOCTXGU2XFZ8TGUSWUXZNYAEBGQOZAW";
    private String url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private String returnUrl = "http://localhost:5173/checkout";
    private String apiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
}
