package com.techzone.computer.modules.manufacturer.controller;

import com.techzone.computer.modules.manufacturer.dto.ManufacturerRequest;
import com.techzone.computer.modules.manufacturer.dto.ManufacturerResponse;
import com.techzone.computer.modules.manufacturer.service.ManufacturerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
@RequiredArgsConstructor
@Tag(name = "Manufacturers", description = "Quản lý nhà sản xuất và thông tin nguồn hàng")
public class ManufacturerController {

    private final ManufacturerService manufacturerService;

    @GetMapping
    @Operation(summary = "Danh sách nhà sản xuất kèm số sản phẩm liên kết")
    public ResponseEntity<List<ManufacturerResponse>> list() {
        return ResponseEntity.ok(manufacturerService.list());
    }

    @GetMapping("/names")
    @Operation(summary = "Danh sách tên nhà sản xuất đang hoạt động (dropdown)")
    public ResponseEntity<List<String>> listNames() {
        return ResponseEntity.ok(manufacturerService.listActiveNames());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Thêm nhà sản xuất mới")
    public ManufacturerResponse create(@Valid @RequestBody ManufacturerRequest req) {
        return manufacturerService.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật nhà sản xuất")
    public ManufacturerResponse update(@PathVariable Long id, @Valid @RequestBody ManufacturerRequest req) {
        return manufacturerService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Xóa nhà sản xuất (sản phẩm liên kết không bị mất)")
    public void delete(@PathVariable Long id) {
        manufacturerService.delete(id);
    }
}
