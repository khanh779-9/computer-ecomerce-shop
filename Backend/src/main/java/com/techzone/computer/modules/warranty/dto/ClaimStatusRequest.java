package com.techzone.computer.modules.warranty.dto;

import jakarta.validation.constraints.NotBlank;

public record ClaimStatusRequest(
        @NotBlank(message = "Trạng thái không được để trống") String status
) {
}
