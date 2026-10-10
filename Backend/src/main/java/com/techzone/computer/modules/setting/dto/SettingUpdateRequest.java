package com.techzone.computer.modules.setting.dto;

import jakarta.validation.constraints.NotBlank;

public record SettingUpdateRequest(
        @NotBlank(message = "Giá trị cấu hình không được để trống") String value,
        String description,
        Boolean isPublic
) {
}
