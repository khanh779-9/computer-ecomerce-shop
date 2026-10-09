package com.techzone.computer.modules.warranty.dto;

import java.time.Instant;

public record RepairStepDto(
        String step,
        String title,
        String description,
        Boolean completed,
        Instant eventAt
) {
}
