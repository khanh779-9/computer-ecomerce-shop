package com.techzone.computer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final RedisRateLimitingFilter rateLimitingFilter;

    public SecurityConfig(RedisRateLimitingFilter rateLimitingFilter) {
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder(@Value("${JWT_SECRET:techzone-dev-secret-key-change-me-in-production}") String secret) {
        SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("role");
        authorities.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var granted = new java.util.ArrayList<>(authorities.convert(jwt));
            String scope = jwt.getClaimAsString("scope");
            if (scope != null && !scope.isBlank()) {
                granted.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("SCOPE_" + scope));
            }
            return granted;
        });
        return converter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(rateLimitingFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Swagger & Actuator
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/health/**").permitAll()
                // Error dispatch — để 404/500 trả đúng trạng thái thay vì bị denyAll mask thành 403
                .requestMatchers("/error").permitAll()
                // Public read endpoints
                .requestMatchers("/api/vouchers/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/health", "/api/products/**", "/api/vouchers/**").permitAll()
                // Auth & Cart (guest-accessible)
                .requestMatchers("/api/auth/**", "/api/cart/**").permitAll()
                // VNPay payment gateway — callback & IPN must be publicly accessible
                .requestMatchers("/api/payment/vnpay/**").permitAll()
                // Orders: guest checkout allowed, single order lookup allowed
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/{id}").permitAll()
                // Authenticated user endpoints
                .requestMatchers("/api/users/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/reviews/my-reviews").authenticated()
                // Customer-only data — token nội bộ (SCOPE_internal) KHÔNG được đọc dữ liệu khách hàng
                .requestMatchers("/api/users/me/addresses/**").hasAuthority("SCOPE_external")
                .requestMatchers(HttpMethod.GET, "/api/warranty/my-warranties").hasAuthority("SCOPE_external")
                .requestMatchers(HttpMethod.POST, "/api/warranty/claims").hasAuthority("SCOPE_external")
                .requestMatchers("/api/wishlist/**").hasAuthority("SCOPE_external")
                .requestMatchers("/api/wishlist").hasAuthority("SCOPE_external")
                // Warranty: public lookup, admin management
                .requestMatchers(HttpMethod.GET, "/api/warranty/lookup").permitAll()
                .requestMatchers("/api/warranty/admin/**").hasRole("ADMIN")
                // Internal-only — token khách hàng (SCOPE_external) không được vào khu vực quản trị
                .requestMatchers("/api/users/**").access((authentication, context) -> {
                    var a = authentication.get().getAuthorities();
                    boolean ok = a.stream().anyMatch(x -> "SCOPE_internal".equals(x.getAuthority()))
                            && a.stream().anyMatch(x -> "ROLE_ADMIN".equals(x.getAuthority()));
                    return new org.springframework.security.authorization.AuthorizationDecision(ok);
                })
                // Reviews: public can submit reviews and like reviews
                .requestMatchers(HttpMethod.POST, "/api/reviews", "/api/reviews/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                // Catalog internal: brands & manufacturers — read authenticated, write admin
                .requestMatchers(HttpMethod.GET, "/api/brands/**", "/api/manufacturers/**").authenticated()
                .requestMatchers("/api/brands/**", "/api/manufacturers/**").hasRole("ADMIN")
                // System settings — admin only
                .requestMatchers("/api/settings/**").hasRole("ADMIN")
                // Admin-only: manage products, all orders, users
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
                .anyRequest().denyAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        return http.build();
    }
}
