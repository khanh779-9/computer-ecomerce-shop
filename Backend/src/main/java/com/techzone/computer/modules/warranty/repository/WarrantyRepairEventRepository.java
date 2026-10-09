package com.techzone.computer.modules.warranty.repository;

import com.techzone.computer.modules.warranty.entity.WarrantyRepairEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WarrantyRepairEventRepository extends JpaRepository<WarrantyRepairEvent, Long> {

    @Query("SELECT MAX(e.stepOrder) FROM WarrantyRepairEvent e WHERE e.claim.id = :claimId")
    Optional<Integer> findMaxStepOrder(@Param("claimId") Long claimId);
}
