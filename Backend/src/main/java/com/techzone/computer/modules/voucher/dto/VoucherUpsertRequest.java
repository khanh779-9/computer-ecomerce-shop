package com.techzone.computer.modules.voucher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record VoucherUpsertRequest(
        @NotBlank(message = "Nhập mã voucher") @Size(max = 50) String code,
        @NotBlank(message = "Nhập mô tả voucher") @Size(max = 255) String description,
        @NotNull @PositiveOrZero Long discountAmount,
        @PositiveOrZero Integer discountPercent,
        @NotNull @PositiveOrZero Long minOrderAmount,
        Boolean isFreeShip,
        Boolean isActive
) {
}
