package com.techzone.computer.modules.voucher.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VoucherValidationResult {
    private boolean valid;
    private String code;
    private String description;
    private Long discountAmount;
    private Boolean isFreeShip;
    private String message;
}
