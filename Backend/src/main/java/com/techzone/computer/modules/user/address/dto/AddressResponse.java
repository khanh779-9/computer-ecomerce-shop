package com.techzone.computer.modules.user.address.dto;

import com.techzone.computer.modules.user.address.entity.CustomerAddress;

import java.time.Instant;

public record AddressResponse(
        Long id,
        String label,
        String recipientName,
        String phone,
        String addressLine,
        String province,
        String district,
        String ward,
        Boolean isDefault,
        Instant createdAt,
        Instant updatedAt
) {
    public static AddressResponse from(CustomerAddress a) {
        return new AddressResponse(
                a.getId(),
                a.getLabel(),
                a.getRecipientName(),
                a.getPhone(),
                a.getAddressLine(),
                a.getProvince(),
                a.getDistrict(),
                a.getWard(),
                a.getIsDefault(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
