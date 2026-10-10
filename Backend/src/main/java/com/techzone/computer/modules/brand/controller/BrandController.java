package com.techzone.computer.modules.brand.controller;

import com.techzone.computer.modules.brand.dto.BrandRequest;
import com.techzone.computer.modules.brand.dto.BrandResponse;
import com.techzone.computer.modules.brand.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Quản lý hãng / thương hiệu trong catalog")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Danh sách hãng kèm thống kê sản phẩm")
    public ResponseEntity<List<BrandResponse>> list() {
        return ResponseEntity.ok(brandService.list());
    }

    @GetMapping("/names")
    @Operation(summary = "Danh sách tên hãng (dùng cho dropdown)")
    public ResponseEntity<List<String>> listNames() {
        return ResponseEntity.ok(brandService.listNames());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Thêm hãng mới")
    public BrandResponse create(@Valid @RequestBody BrandRequest req) {
        return brandService.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật hãng")
    public BrandResponse update(@PathVariable Long id, @Valid @RequestBody BrandRequest req) {
        return brandService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Xóa hãng (sản phẩm liên kết không bị mất)")
    public void delete(@PathVariable Long id) {
        brandService.delete(id);
    }
}
