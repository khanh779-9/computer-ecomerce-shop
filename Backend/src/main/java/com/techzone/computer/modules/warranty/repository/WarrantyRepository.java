package com.techzone.computer.modules.warranty.repository;

import com.techzone.computer.modules.warranty.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WarrantyRepository extends JpaRepository<Warranty, Long> {

    Optional<Warranty> findBySerialId(Long serialId);

    boolean existsBySerialId(Long serialId);

    @Query("""
            SELECT DISTINCT w FROM Warranty w
            LEFT JOIN FETCH w.claims
            WHERE w.serial.id IN :serialIds
            """)
    List<Warranty> findBySerialIdsWithClaims(@Param("serialIds") List<Long> serialIds);

    @Query("""
            SELECT DISTINCT w FROM Warranty w
            LEFT JOIN FETCH w.claims
            ORDER BY w.createdAt DESC
            """)
    List<Warranty> findAllWithClaims();
}
