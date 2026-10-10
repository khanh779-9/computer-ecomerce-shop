package com.techzone.computer.modules.voucher.repository;

import com.techzone.computer.modules.voucher.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCodeIgnoreCaseAndIsActiveTrue(String code);
    List<Voucher> findByIsActiveTrue();
    List<Voucher> findAllByOrderByCreatedAtDesc();
    boolean existsByCodeIgnoreCase(String code);
}
