package com.techzone.computer.modules.warranty.controller;

import com.techzone.computer.modules.warranty.dto.AdminWarrantyRow;
import com.techzone.computer.modules.warranty.dto.ClaimStatusRequest;
import com.techzone.computer.modules.warranty.dto.RepairEventRequest;
import com.techzone.computer.modules.warranty.dto.SerialRegisterRequest;
import com.techzone.computer.modules.warranty.dto.WarrantyClaimRequest;
import com.techzone.computer.modules.warranty.dto.WarrantyLookupItem;
import com.techzone.computer.modules.warranty.service.WarrantyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warranty")
@RequiredArgsConstructor
@Tag(name = "Warranty & RMA", description = "Tra cứu bảo hành, yêu cầu bảo hành (claim) và quy trình sửa chữa")
public class WarrantyController {

    private final WarrantyService warrantyService;

    // =============== PUBLIC ===============

    @GetMapping("/lookup")
    @Operation(summary = "Tra cứu bảo hành công khai theo Serial / SĐT / Mã RMA")
    public ResponseEntity<List<WarrantyLookupItem>> lookup(@RequestParam("q") String query) {
        return ResponseEntity.ok(warrantyService.lookup(query));
    }

    // =============== CUSTOMER (AUTHENTICATED) ===============

    @GetMapping("/my-warranties")
    @Operation(summary = "Danh sách bảo hành của khách hàng đang đăng nhập")
    public ResponseEntity<List<WarrantyLookupItem>> myWarranties(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(warrantyService.myWarranties(Long.parseLong(jwt.getSubject())));
    }

    @PostMapping("/claims")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Khách hàng tạo yêu cầu bảo hành (claim) theo serial của mình")
    public WarrantyLookupItem createClaim(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody WarrantyClaimRequest req) {
        return warrantyService.createClaim(Long.parseLong(jwt.getSubject()), req);
    }

    // =============== ADMIN ===============

    @GetMapping("/admin/warranties")
    @Operation(summary = "[Admin] Danh sách toàn bộ serial & bảo hành kèm claim/sự kiện sửa chữa")
    public ResponseEntity<List<AdminWarrantyRow>> adminList() {
        return ResponseEntity.ok(warrantyService.adminListWarranties());
    }

    @PostMapping("/admin/serials")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "[Admin] Đăng ký serial mới & kích hoạt bảo hành khi xuất kho/bán hàng")
    public AdminWarrantyRow adminRegisterSerial(@Valid @RequestBody SerialRegisterRequest req) {
        return warrantyService.adminRegisterSerial(req);
    }

    @PatchMapping("/admin/claims/{id}/status")
    @Operation(summary = "[Admin] Cập nhật trạng thái claim bảo hành")
    public AdminWarrantyRow adminUpdateClaimStatus(@PathVariable Long id, @Valid @RequestBody ClaimStatusRequest req) {
        return warrantyService.adminUpdateClaimStatus(id, req);
    }

    @PostMapping("/admin/claims/{id}/events")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "[Admin] Thêm bước xử lý (repair event) vào timeline của claim")
    public AdminWarrantyRow adminAddRepairEvent(@PathVariable Long id, @Valid @RequestBody RepairEventRequest req) {
        return warrantyService.adminAddRepairEvent(id, req);
    }
}
