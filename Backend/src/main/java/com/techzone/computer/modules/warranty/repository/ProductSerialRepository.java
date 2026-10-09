package com.techzone.computer.modules.warranty.repository;

import com.techzone.computer.modules.warranty.entity.ProductSerial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductSerialRepository extends JpaRepository<ProductSerial, Long> {

    Optional<ProductSerial> findBySerialNumberIgnoreCase(String serialNumber);

    boolean existsBySerialNumberIgnoreCase(String serialNumber);

    List<ProductSerial> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("""
            SELECT s FROM ProductSerial s
            JOIN FETCH s.product
            LEFT JOIN FETCH s.customer
            WHERE LOWER(s.serialNumber) LIKE LOWER(CONCAT('%', :q, '%'))
               OR (s.customer IS NOT NULL AND s.customer.phone LIKE CONCAT('%', :q, '%'))
               OR EXISTS (SELECT c FROM WarrantyClaim c
                          WHERE c.warranty.serial.id = s.id
                            AND LOWER(c.rmaCode) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    List<ProductSerial> searchBySerialOrPhoneOrRma(@Param("q") String query);

    @Query("""
            SELECT s FROM ProductSerial s
            JOIN FETCH s.product
            LEFT JOIN FETCH s.customer
            WHERE s.customer.id = :customerId
            ORDER BY s.createdAt DESC
            """)
    List<ProductSerial> findWithDetailsByCustomerId(@Param("customerId") Long customerId);

    @Query("""
            SELECT s FROM ProductSerial s
            JOIN FETCH s.product
            LEFT JOIN FETCH s.customer
            ORDER BY s.createdAt DESC
            """)
    List<ProductSerial> findAllWithDetails();
}
