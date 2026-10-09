package com.techzone.computer.modules.user.address.controller;

import com.techzone.computer.modules.user.address.dto.AddressRequest;
import com.techzone.computer.modules.user.address.dto.AddressResponse;
import com.techzone.computer.modules.user.address.service.AddressService;
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
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
@Tag(name = "Customer Address Book", description = "CRUD sổ địa chỉ giao nhận của khách hàng đang đăng nhập")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Danh sách địa chỉ của tôi")
    public ResponseEntity<List<AddressResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(addressService.listMyAddresses(Long.parseLong(jwt.getSubject())));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Thêm địa chỉ mới")
    public AddressResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AddressRequest req) {
        return addressService.create(Long.parseLong(jwt.getSubject()), req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật địa chỉ")
    public AddressResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest req
    ) {
        return addressService.update(Long.parseLong(jwt.getSubject()), id, req);
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Đặt địa chỉ mặc định")
    public AddressResponse setDefault(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return addressService.setDefault(Long.parseLong(jwt.getSubject()), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Xóa địa chỉ")
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        addressService.delete(Long.parseLong(jwt.getSubject()), id);
    }
}
