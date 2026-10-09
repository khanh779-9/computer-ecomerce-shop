package com.techzone.computer.modules.product.repository;

import com.techzone.computer.modules.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderBySortOrderAscIdAsc(Long productId);

    Optional<ProductImage> findFirstByProductIdOrderByIsPrimaryDescSortOrderAscIdAsc(Long productId);

    Optional<ProductImage> findByIdAndProductId(Long id, Long productId);

    void deleteByProductId(Long productId);

    long countByProductId(Long productId);
}
