package com.techzone.computer.modules.brand.repository;

import com.techzone.computer.modules.brand.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    @Query("SELECT b.name FROM Brand b")
    List<String> findAllNames();

    @Query("""
            SELECT b.id, b.name, b.slug, COALESCE(b.isActive, true),
                   COUNT(p.id) AS productCount,
                   COALESCE(SUM(p.stock), 0) AS totalStock,
                   COALESCE(SUM(p.sold), 0) AS totalSold
            FROM Brand b
            LEFT JOIN Product p ON p.brandId = b.id
            GROUP BY b.id, b.name, b.slug, COALESCE(b.isActive, true)
            ORDER BY productCount DESC
            """)
    List<Object[]> findAllWithProductStats();
}
