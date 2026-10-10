package com.techzone.computer.modules.setting.controller;

import com.techzone.computer.modules.setting.dto.SettingResponse;
import com.techzone.computer.modules.setting.dto.SettingUpdateRequest;
import com.techzone.computer.modules.setting.service.SettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "[Admin] Chính sách vận hành và cấu hình hệ thống")
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    @Operation(summary = "[Admin] Danh sách cấu hình hệ thống")
    public ResponseEntity<List<SettingResponse>> list() {
        return ResponseEntity.ok(settingService.listAll());
    }

    @GetMapping("/{key}")
    @Operation(summary = "[Admin] Lấy cấu hình theo khóa")
    public ResponseEntity<SettingResponse> get(@PathVariable String key) {
        return ResponseEntity.ok(settingService.getByKey(key));
    }

    @PutMapping("/{key}")
    @Operation(summary = "[Admin] Cập nhật / tạo cấu hình theo khóa")
    public SettingResponse upsert(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String key,
            @Valid @RequestBody SettingUpdateRequest req
    ) {
        return settingService.upsert(Long.parseLong(jwt.getSubject()), key, req);
    }
}
