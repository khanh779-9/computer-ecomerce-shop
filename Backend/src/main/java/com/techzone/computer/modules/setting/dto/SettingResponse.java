package com.techzone.computer.modules.setting.dto;

public record SettingResponse(
        Long id,
        String key,
        String value,
        String valueType,
        String description,
        Boolean isPublic,
        Long updatedBy,
        String updatedAt
) {
}
