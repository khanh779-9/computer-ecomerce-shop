package com.techzone.computer.modules.manufacturer.dto;

public record ManufacturerResponse(
        Long id,
        String name,
        String slug,
        String website,
        String contactEmail,
        String phone,
        Boolean isActive,
        Long productCount
) {
}
