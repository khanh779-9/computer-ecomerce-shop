package com.techzone.computer.modules.user.address.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank(message = "Nhập tên người nhận") @Size(max = 150) String recipientName,
        @NotBlank(message = "Nhập số điện thoại") @Size(max = 20) String phone,
        @NotBlank(message = "Nhập địa chỉ chi tiết") String addressLine,
        @Size(max = 40) String label,
        @Size(max = 100) String province,
        @Size(max = 100) String district,
        @Size(max = 100) String ward,
        Boolean isDefault
) {
}
