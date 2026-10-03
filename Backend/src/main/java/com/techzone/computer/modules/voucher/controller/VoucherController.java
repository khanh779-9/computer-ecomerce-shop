package com.techzone.computer.modules.voucher.controller;

import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.entity.Voucher;
import com.techzone.computer.modules.voucher.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Discounts & Vouchers", description = "Endpoints cho mã giảm giá khuyến mãi")
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    @Operation(summary = "Lấy danh sách mã giảm giá khả dụng")
    public ResponseEntity<List<Voucher>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }

    @GetMapping("/validate")
    @Operation(summary = "Kiểm tra tính hợp lệ của mã giảm giá cho giỏ hàng")
    public ResponseEntity<VoucherValidationResult> validateVoucher(
            @RequestParam String code,
            @RequestParam(defaultValue = "0") Long orderAmount) {
        return ResponseEntity.ok(voucherService.validate(code, orderAmount));
    }
}
