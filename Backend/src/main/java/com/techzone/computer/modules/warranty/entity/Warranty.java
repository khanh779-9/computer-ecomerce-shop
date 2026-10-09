package com.techzone.computer.modules.warranty.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warranties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warranty {

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_IN_REPAIR = "IN_REPAIR";
    public static final String STATUS_READY_FOR_PICKUP = "READY_FOR_PICKUP";
    public static final String STATUS_EXPIRED = "EXPIRED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "serial_id", nullable = false, unique = true)
    private ProductSerial serial;

    @Builder.Default
    @Column(name = "warranty_months", nullable = false)
    private Integer warrantyMonths = 12;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = STATUS_ACTIVE;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Builder.Default
    @OneToMany(mappedBy = "warranty", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarrantyClaim> claims = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String effectiveStatus(Instant now) {
        if (STATUS_ACTIVE.equals(this.status) && this.expiresAt != null && this.expiresAt.isBefore(now)) {
            return STATUS_EXPIRED;
        }
        return this.status;
    }
}
