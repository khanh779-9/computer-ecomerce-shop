package com.techzone.computer.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Distributed sliding-window rate limiter powered by Redis.
 * Falls back gracefully to allow requests if Redis is unavailable.
 */
@Component
public class RedisRateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RedisRateLimitingFilter.class);

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitingFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Determine rate limit config based on path and method
        RateLimitRule rule = resolveRule(method, path);
        if (rule == null || redisTemplate == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String redisKey = "computer-shop/ratelimit:" + rule.category + ":" + clientIp;

        try {
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);
            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(rule.windowSeconds));
            }

            if (currentRequests != null && currentRequests > rule.maxRequests) {
                Long ttl = redisTemplate.getExpire(redisKey);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.setHeader("Retry-After", String.valueOf(ttl != null && ttl > 0 ? ttl : 60));
                response.getWriter().write(String.format(
                        "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau %d giây.\",\"retryAfter\":%d}",
                        ttl != null && ttl > 0 ? ttl : 60,
                        ttl != null && ttl > 0 ? ttl : 60
                ));
                return;
            }
        } catch (Exception ex) {
            // Redis error fallback: Log and proceed without blocking legitimate user traffic
            log.warn("Redis rate limiter unavailable ({}). Bypassing rate limit for IP: {}", ex.getMessage(), clientIp);
        }

        filterChain.doFilter(request, response);
    }

    private RateLimitRule resolveRule(String method, String path) {
        // 1. Auth endpoints (login, register) - Max 15 req / min
        if (path.startsWith("/api/auth/")) {
            return new RateLimitRule("auth", 15, 60);
        }

        // 2. Orders submission (guest/customer checkout) - Max 10 req / min
        if ("POST".equalsIgnoreCase(method) && "/api/orders".equals(path)) {
            return new RateLimitRule("order", 10, 60);
        }

        // 3. Product search & list querying - Max 120 req / min
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/products")) {
            return new RateLimitRule("product_search", 120, 60);
        }

        return null;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitRule {
        final String category;
        final int maxRequests;
        final int windowSeconds;

        RateLimitRule(String category, int maxRequests, int windowSeconds) {
            this.category = category;
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }
    }
}
