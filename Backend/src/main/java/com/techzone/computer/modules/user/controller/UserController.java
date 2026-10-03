package com.techzone.computer.modules.user.controller;

import com.techzone.computer.modules.user.dto.UserDto;
import com.techzone.computer.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile & Membership", description = "Endpoints quản lý thông tin thành viên, hạng & điểm thưởng")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản đang đăng nhập (từ JWT)")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin tài khoản theo ID")
    public ResponseEntity<UserDto> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @GetMapping("/by-email")
    @Operation(summary = "Lấy thông tin tài khoản theo email")
    public ResponseEntity<UserDto> getProfileByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.getProfileByEmail(email));
    }
}
