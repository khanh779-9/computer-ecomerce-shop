package com.techzone.computer.modules.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank(message = "Nhập tên hãng") @Size(max = 100) String name,
        @Size(max = 100) String slug,
        Boolean isActive
) {
}
