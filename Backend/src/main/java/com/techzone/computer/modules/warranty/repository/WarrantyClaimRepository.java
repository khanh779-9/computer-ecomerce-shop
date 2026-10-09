package com.techzone.computer.modules.warranty.repository;

import com.techzone.computer.modules.warranty.entity.WarrantyClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {

    boolean existsByRmaCode(String rmaCode);

    @Query("""
            SELECT c FROM WarrantyClaim c
            LEFT JOIN FETCH c.events
            WHERE c.id IN :ids
            ORDER BY c.receivedAt DESC
            """)
    List<WarrantyClaim> findByIdsWithEvents(@Param("ids") List<Long> ids);
}
