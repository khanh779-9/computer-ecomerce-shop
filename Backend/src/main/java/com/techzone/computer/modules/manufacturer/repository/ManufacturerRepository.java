package com.techzone.computer.modules.manufacturer.repository;

import com.techzone.computer.modules.manufacturer.entity.Manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {

    Optional<Manufacturer> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    List<Manufacturer> findAllByOrderByNameAsc();

    @Query("SELECT m.name FROM Manufacturer m WHERE COALESCE(m.isActive, true) = true")
    List<String> findActiveNames();

    @Query("""
            SELECT p.manufacturerId, COUNT(p.id)
            FROM Product p
            WHERE p.manufacturerId IS NOT NULL
            GROUP BY p.manufacturerId
            """)
    List<Object[]> countProductsByManufacturerId();
}
