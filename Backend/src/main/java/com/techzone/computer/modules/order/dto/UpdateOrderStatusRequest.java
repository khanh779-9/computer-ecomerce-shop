package com.techzone.computer.modules.order.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(@NotBlank(message = "Status không được để trống") String status) {
}
