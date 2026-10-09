package com.techzone.computer.modules.warranty.dto;

import java.time.Instant;
import java.util.List;

public record AdminWarrantyRow(
        Long warrantyId,
        Long serialId,
        String serialNumber,
        Long productId,
        String productName,
        String productBrand,
        Long customerId,
        String customerName,
        String customerEmail,
        String customerPhone,
        Instant startsAt,
        Instant expiresAt,
        Integer warrantyMonths,
        String status,
        Long claimId,
        String rmaCode,
        String claimIssue,
        String claimStatus,
        Instant receivedAt,
        Instant resolvedAt,
        List<RepairStepDto> repairTimeline
) {
}
