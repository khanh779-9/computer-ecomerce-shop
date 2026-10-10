package com.techzone.computer.common.security;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Trích xuất định danh từ JWT một cách an toàn theo scope:
 * - Token nội bộ (users table) và token khách (customers table) có ID_space RIÊNG BIỆT,
 *   vì vậy không bao giờ dùng sub của token internal như customer id và ngược lại.
 */
public final class JwtSubjects {

    private JwtSubjects() {
    }

    /**
     * Trả về customer id chỉ khi token có scope=external (đăng nhập từ bảng customers).
     * Token nội bộ hoặc token legacy không có scope sẽ trả về null.
     */
    public static Long externalCustomerId(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        String scope = jwt.getClaimAsString("scope");
        if (scope == null || !TokenService.SCOPE_EXTERNAL.equals(scope)) {
            return null;
        }
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Trả về user nội bộ id chỉ khi token có scope=internal.
     */
    public static Long internalUserId(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        String scope = jwt.getClaimAsString("scope");
        if (scope == null || !TokenService.SCOPE_INTERNAL.equals(scope)) {
            return null;
        }
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Scope của token ("internal" / "external") hoặc null với token legacy.
     */
    public static String scopeOf(Jwt jwt) {
        return jwt == null ? null : jwt.getClaimAsString("scope");
    }
}
