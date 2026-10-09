package com.techzone.computer.modules.cart.repository;

import com.techzone.computer.modules.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.product WHERE c.customer.id = :customerId")
    Optional<Cart> findByCustomerIdWithItems(@Param("customerId") Long customerId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.product WHERE c.sessionId = :sessionId")
    Optional<Cart> findBySessionIdWithItems(@Param("sessionId") String sessionId);

    Optional<Cart> findByCustomerId(Long customerId);
    Optional<Cart> findBySessionId(String sessionId);
}
