package com.techzone.computer.modules.user.address.repository;

import com.techzone.computer.modules.user.address.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {

    List<CustomerAddress> findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(Long customerId);

    Optional<CustomerAddress> findByIdAndCustomerId(Long id, Long customerId);

    @Modifying
    @Query("UPDATE CustomerAddress a SET a.isDefault = false WHERE a.customer.id = :customerId AND a.isDefault = true")
    void clearDefaultForCustomer(@Param("customerId") Long customerId);

    long countByCustomerId(Long customerId);
}
