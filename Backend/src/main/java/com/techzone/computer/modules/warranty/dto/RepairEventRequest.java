package com.techzone.computer.modules.warranty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RepairEventRequest(
        @NotBlank(message = "Nhập tiêu đề bước xử lý") @Size(max = 200) String title,
        String description,
        Boolean completed
) {
}
