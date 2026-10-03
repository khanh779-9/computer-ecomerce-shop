package com.techzone.computer.modules.voucher.service;

import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.entity.Voucher;
import com.techzone.computer.modules.voucher.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
