package com.techzone.computer.modules.warranty.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "warranty_repair_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRepairEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private WarrantyClaim claim;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "event_at", nullable = false)
    private Instant eventAt = Instant.now();

    @Builder.Default
    @Column(nullable = false)
    private Boolean completed = false;
}
