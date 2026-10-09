package com.techzone.computer.modules.warranty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SerialRegisterRequest(
        @NotNull(message = "Chọn sản phẩm") Long productId,
        @NotBlank(message = "Nhập số serial") @Size(max = 120) String serialNumber,
        Integer warrantyMonths,
        String customerEmail,
        Long orderId
) {
}
