package com.techzone.computer.modules.review.repository;

import com.techzone.computer.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByProductIdAndStatus(Long productId, String status);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED' GROUP BY r.rating")
    List<Object[]> countRatingsByStar(@Param("productId") Long productId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
