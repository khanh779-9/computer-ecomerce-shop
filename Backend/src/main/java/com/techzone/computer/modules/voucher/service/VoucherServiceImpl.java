package com.techzone.computer.modules.voucher.service;

import com.techzone.computer.modules.voucher.dto.VoucherUpsertRequest;
import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.entity.Voucher;
import com.techzone.computer.modules.voucher.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "active_vouchers")
    @Transactional(readOnly = true)
    public List<Voucher> getActiveVouchers() {
        return voucherRepository.findByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc();
    }

    // =============== ADMIN CRUD ===============

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "active_vouchers", allEntries = true)
    public Voucher create(VoucherUpsertRequest req) {
        String code = req.code().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalStateException("Mã voucher '" + code + "' đã tồn tại trong hệ thống");
        }

        Voucher voucher = new Voucher();
        applyUpsert(voucher, code, req);
        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "active_vouchers", allEntries = true)
    public Voucher update(Long id, VoucherUpsertRequest req) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy voucher ID: " + id));

        String code = req.code().trim().toUpperCase();
        if (!voucher.getCode().equalsIgnoreCase(code) && voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalStateException("Mã voucher '" + code + "' đã tồn tại trong hệ thống");
        }
        applyUpsert(voucher, code, req);
        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "active_vouchers", allEntries = true)
    public Voucher setActive(Long id, Boolean isActive) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy voucher ID: " + id));
        voucher.setIsActive(Boolean.TRUE.equals(isActive));
        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "active_vouchers", allEntries = true)
    public void delete(Long id) {
        if (!voucherRepository.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy voucher ID: " + id);
        }
        voucherRepository.deleteById(id);
    }

    private void applyUpsert(Voucher voucher, String code, VoucherUpsertRequest req) {
        voucher.setCode(code);
        voucher.setDescription(req.description().trim());
        voucher.setDiscountAmount(req.discountAmount() != null ? req.discountAmount() : 0L);
        voucher.setDiscountPercent(req.discountPercent() != null ? req.discountPercent() : 0);
        voucher.setMinOrderAmount(req.minOrderAmount() != null ? req.minOrderAmount() : 0L);
        voucher.setIsFreeShip(Boolean.TRUE.equals(req.isFreeShip()));
        if (req.isActive() != null) {
            voucher.setIsActive(req.isActive());
        } else if (voucher.getIsActive() == null) {
            voucher.setIsActive(true);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherValidationResult validate(String code, Long orderAmount) {
        if (code == null || code.isBlank()) {
            return invalid("Vui lòng nhập mã giảm giá");
        }

        long amount = orderAmount != null ? orderAmount : 0L;

        return voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim())
                .map(v -> {
                    if (amount < v.getMinOrderAmount()) {
                        return VoucherValidationResult.builder()
                                .valid(false)
                                .message("Đơn hàng tối thiểu " + v.getMinOrderAmount() + "đ để áp dụng mã này")
                                .build();
                    }
                    return VoucherValidationResult.builder()
                            .valid(true)
                            .code(v.getCode())
                            .description(v.getDescription())
                            .discountAmount(calculateDiscount(v, amount))
                            .isFreeShip(Boolean.TRUE.equals(v.getIsFreeShip()))
                            .message("Áp dụng mã giảm giá thành công!")
                            .build();
                })
                .orElseGet(() -> invalid("Mã giảm giá không tồn tại hoặc đã hết hạn"));
    }

    private long calculateDiscount(Voucher voucher, long orderAmount) {
        long discount = voucher.getDiscountAmount();
        if (voucher.getDiscountPercent() != null && voucher.getDiscountPercent() > 0) {
            long percentDiscount = (orderAmount * voucher.getDiscountPercent()) / 100;
            discount = Math.max(discount, percentDiscount);
        }
        return Math.min(discount, orderAmount);
    }

    private VoucherValidationResult invalid(String message) {
        return VoucherValidationResult.builder()
                .valid(false)
                .message(message)
                .build();
    }
}
