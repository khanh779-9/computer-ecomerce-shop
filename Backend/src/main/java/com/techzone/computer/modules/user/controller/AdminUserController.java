package com.techzone.computer.modules.user.controller;

import com.techzone.computer.modules.user.dto.EmployeeRequest;
import com.techzone.computer.modules.user.dto.UserDto;
import com.techzone.computer.modules.user.service.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "[Admin] Quản lý tài khoản nhân viên & phân quyền trang nội bộ")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "[Admin] Danh sách nhân viên / tài khoản nội bộ")
    public ResponseEntity<List<UserDto>> list() {
        return ResponseEntity.ok(userService.listEmployees());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "[Admin] Tạo tài khoản nhân viên mới")
    public UserDto create(@Valid @RequestBody EmployeeRequest req) {
        return userService.createEmployee(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "[Admin] Cập nhật thông tin / phân quyền nhân viên")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest req) {
        return userService.updateEmployee(id, req);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "[Admin] Khóa / mở khóa tài khoản nhân viên")
    public UserDto setStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.setEmployeeStatus(id, body.getOrDefault("status", ""));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "[Admin] Xóa tài khoản nhân viên")
    public void delete(@PathVariable Long id) {
        userService.deleteEmployee(id);
    }
}
