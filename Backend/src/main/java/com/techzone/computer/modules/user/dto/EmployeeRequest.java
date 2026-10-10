package com.techzone.computer.modules.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmployeeRequest(
        @NotBlank(message = "Nhập email") @Email(message = "Email không hợp lệ") String email,
        @NotBlank(message = "Nhập họ tên") @Size(max = 150) String fullName,
        @Size(max = 20) String phone,
        String password,
        String role
) {
}
