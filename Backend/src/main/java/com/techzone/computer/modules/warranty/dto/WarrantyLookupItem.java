package com.techzone.computer.modules.warranty.dto;

import java.util.List;

public record WarrantyLookupItem(
        String serialNumber,
        String customerName,
        String customerPhone,
        String productName,
        String productBrand,
        String productCategory,
        String purchaseDate,
        Integer warrantyPeriodMonths,
        String warrantyExpiryDate,
        String status,
        String rmaCode,
        String repairIssue,
        String claimStatus,
        List<RepairStepDto> repairTimeline
) {
}
