package com.techzone.computer.modules.warranty.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warranty_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyClaim {

    public static final String STATUS_RECEIVED = "RECEIVED";
    public static final String STATUS_DIAGNOSED = "DIAGNOSED";
    public static final String STATUS_REPAIRING = "REPAIRING";
    public static final String STATUS_TESTING = "TESTING";
    public static final String STATUS_RESOLVED = "RESOLVED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warranty_id", nullable = false)
    private Warranty warranty;

    @Column(name = "rma_code", nullable = false, unique = true, length = 80)
    private String rmaCode;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String issue;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = STATUS_RECEIVED;

    @Builder.Default
    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Builder.Default
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<WarrantyRepairEvent> events = new ArrayList<>();
}
