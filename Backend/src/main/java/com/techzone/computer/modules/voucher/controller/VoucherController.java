package com.techzone.computer.modules.voucher.controller;

import com.techzone.computer.modules.voucher.dto.VoucherUpsertRequest;
import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.entity.Voucher;
import com.techzone.computer.modules.voucher.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // =============== ADMIN ===============

    @GetMapping("/admin/all")
    @Operation(summary = "[Admin] Toàn bộ voucher (kể cả đã tắt)")
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "[Admin] Tạo voucher mới")
    public Voucher create(@Valid @RequestBody VoucherUpsertRequest req) {
        return voucherService.create(req);
    }

    @PutMapping("/admin/{id}")
    @Operation(summary = "[Admin] Cập nhật voucher")
    public Voucher update(@PathVariable Long id, @Valid @RequestBody VoucherUpsertRequest req) {
        return voucherService.update(id, req);
    }

    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "[Admin] Bật / tạm dừng voucher")
    public Voucher setActive(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return voucherService.setActive(id, body.getOrDefault("isActive", true));
    }

    @DeleteMapping("/admin/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "[Admin] Xóa voucher")
    public void delete(@PathVariable Long id) {
        voucherService.delete(id);
    }
}
