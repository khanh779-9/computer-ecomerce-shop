package com.techzone.computer.modules.voucher.controller;

import com.techzone.computer.modules.voucher.entity.Voucher;
import com.techzone.computer.modules.voucher.repository.VoucherRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Discounts & Vouchers", description = "Endpoints cho mã giảm giá khuyến mãi")
public class VoucherController {

    private final VoucherRepository voucherRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách mã giảm giá khả dụng")
    public ResponseEntity<List<Voucher>> getActiveVouchers() {
        return ResponseEntity.ok(voucherRepository.findByIsActiveTrue());
    }

    @GetMapping("/validate")
    @Operation(summary = "Kiểm tra tính hợp lệ của mã giảm giá cho giỏ hàng")
    public ResponseEntity<VoucherValidationResult> validateVoucher(
            @RequestParam String code,
            @RequestParam(defaultValue = "0") Long orderAmount) {
        
        return voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim())
                .map(v -> {
                    if (orderAmount < v.getMinOrderAmount()) {
                        return ResponseEntity.ok(VoucherValidationResult.builder()
                                .valid(false)
                                .message("Đơn hàng tối thiểu " + v.getMinOrderAmount() + "đ để áp dụng mã này")
                                .build());
                    }

                    long calculatedDiscount = v.getDiscountAmount();
                    if (v.getDiscountPercent() != null && v.getDiscountPercent() > 0) {
                        long percentDiscount = (orderAmount * v.getDiscountPercent()) / 100;
                        calculatedDiscount = Math.max(calculatedDiscount, percentDiscount);
                    }

                    return ResponseEntity.ok(VoucherValidationResult.builder()
                            .valid(true)
                            .code(v.getCode())
                            .description(v.getDescription())
                            .discountAmount(calculatedDiscount)
                            .isFreeShip(Boolean.TRUE.equals(v.getIsFreeShip()))
                            .message("Áp dụng mã giảm giá thành công!")
                            .build());
                })
                .orElse(ResponseEntity.ok(VoucherValidationResult.builder()
                        .valid(false)
                        .message("Mã giảm giá không tồn tại hoặc đã hết hạn")
                        .build()));
    }

    @Data
    @Builder
    public static class VoucherValidationResult {
        private boolean valid;
        private String code;
        private String description;
        private Long discountAmount;
        private Boolean isFreeShip;
        private String message;
    }
}
