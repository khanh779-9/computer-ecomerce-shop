package com.techzone.computer.modules.manufacturer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ManufacturerRequest(
        @NotBlank(message = "Nhập tên nhà sản xuất") @Size(max = 150) String name,
        @Size(max = 150) String slug,
        @Size(max = 500) String website,
        @Size(max = 255) String contactEmail,
        @Size(max = 30) String phone,
        Boolean isActive
) {
}
