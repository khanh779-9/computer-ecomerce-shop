package com.techzone.computer.modules.warranty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WarrantyClaimRequest(
        @NotBlank(message = "Nhập số serial của sản phẩm") @Size(max = 120) String serialNumber,
        @NotBlank(message = "Mô tả lỗi không được để trống") String issue
) {
}
