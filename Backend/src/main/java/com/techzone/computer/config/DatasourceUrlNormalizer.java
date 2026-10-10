package com.techzone.computer.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Chuẩn hóa cấu hình DataSource cho các nền tảng deploy (Render, Railway, Heroku...):
 * - URL Postgres của Render dạng "postgresql://user:pass@host:port/db" (thiếu tiền tố jdbc:) —
 *   tự thêm tiền tố "jdbc:" để Hikari nhận diện được driver.
 * - Hỗ trợ biến DATABASE_URL (convention của Render) khi DB_URL không được đặt.
 * Chạy sau ConfigDataEnvironmentPostProcessor để ghi đè giá trị đã resolve từ yml/.env.
 */
public class DatasourceUrlNormalizer implements EnvironmentPostProcessor, Ordered {

    private static final String DATASOURCE_URL = "spring.datasource.url";
    private static final String DATASOURCE_USERNAME = "spring.datasource.username";
    private static final String DATASOURCE_PASSWORD = "spring.datasource.password";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = firstNonBlank(
                environment.getProperty("DB_URL"),
                environment.getProperty("DATABASE_URL")
        );

        Map<String, Object> overrides = new HashMap<>();
        if (url != null && !url.isBlank()) {
            overrides.put(DATASOURCE_URL, normalizeJdbcUrl(url.trim()));

            // Ưu tiên: OS env vars (Render/systemEnvironment) -> credentials nhúng trong URL.
            // KHÔNG dùng default trong yml/.env (vd: postgres) đè lên credentials của URL.
            String username = getFromSystemEnv(environment, "DB_USERNAME", "DATABASE_USERNAME");
            if (username == null) {
                username = extractUserFromUrl(url);
            }
            if (username != null) {
                overrides.put(DATASOURCE_USERNAME, username);
            }
            String password = getFromSystemEnv(environment, "DB_PASSWORD", "DATABASE_PASSWORD");
            if (password == null) {
                password = extractPasswordFromUrl(url);
            }
            if (password != null) {
                overrides.put(DATASOURCE_PASSWORD, password);
            }
        } else {
            // DB_URL/DATABASE_URL bị set RỖNG (hoặc không set) — placeholder trong yml sẽ resolve
            // thành chuỗi rỗng làm Hikari báo "Failed to determine a suitable driver class".
            // Ghi đè bằng default cục bộ để lỗi (nếu có) rõ ràng: Connection refused thay vì driver error.
            overrides.put(DATASOURCE_URL, "jdbc:postgresql://localhost:5432/techzone_computer");
            overrides.put(DATASOURCE_USERNAME, "postgres");
            overrides.put(DATASOURCE_PASSWORD, "123");
        }

        environment.getPropertySources().addFirst(
                new MapPropertySource("techzoneDatasourceNormalizer", overrides)
        );
    }

    /**
     * Chuyển URL kiểu libpq/Render ("postgres://user:pass@host:port/db?params") thành JDBC URL chuẩn.
     * PostgreSQL JDBC driver KHÔNG hỗ trợ user:pass@host trong URL — phải tách credentials
     * đưa vào spring.datasource.username/password và chỉ giữ host:port/db trên URL.
     * URL đã là jdbc: nhưng còn credentials nhúng cũng được làm sạch tương tự.
     */
    private String normalizeJdbcUrl(String url) {
        String scheme = "jdbc:postgresql:";
        String body = url;
        if (url.startsWith("jdbc:")) {
            int afterScheme = url.indexOf("://");
            if (afterScheme > 0) {
                scheme = url.substring(0, afterScheme + 1);
                body = url.substring(afterScheme + 3);
            } else {
                return url;
            }
        } else {
            int schemeEnd = url.indexOf("://");
            if (schemeEnd < 0) {
                return "jdbc:" + url;
            }
            body = url.substring(schemeEnd + 3);
        }

        String query = "";
        int qIdx = body.indexOf('?');
        if (qIdx >= 0) {
            query = body.substring(qIdx + 1);
            body = body.substring(0, qIdx);
        }

        // Tách credentials khỏi authority: user:pass@host:port/db -> host:port/db
        int at = body.lastIndexOf('@');
        if (at >= 0) {
            body = body.substring(at + 1);
        }

        String normalized = scheme + "//" + body;

        // Aiven khuyến nghị SSL — tự thêm sslmode=require nếu host aivencloud chưa có
        if (normalized.contains("aivencloud.com") && !query.contains("sslmode=")) {
            query = query.isBlank() ? "sslmode=require" : query + "&sslmode=require";
        }
        if (!query.isBlank()) {
            normalized = normalized + "?" + query;
        }
        return normalized;
    }

    /** Trích user từ URL dạng postgresql://user:pass@host/db (Render không tách username/password riêng). */
    private String extractUserFromUrl(String url) {
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) return null;
        String authority = url.substring(schemeEnd + 3);
        int at = authority.indexOf('@');
        if (at <= 0) return null;
        String credentials = authority.substring(0, at);
        int colon = credentials.indexOf(':');
        return colon > 0 ? credentials.substring(0, colon) : credentials;
    }

    private String extractPasswordFromUrl(String url) {
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) return null;
        String authority = url.substring(schemeEnd + 3);
        int at = authority.indexOf('@');
        if (at <= 0) return null;
        String credentials = authority.substring(0, at);
        int colon = credentials.indexOf(':');
        return colon >= 0 ? credentials.substring(colon + 1) : null;
    }

    /** Đọc giá trị CHỈ từ OS environment variables (bỏ qua default trong yml/.env config files). */
    private String getFromSystemEnv(ConfigurableEnvironment environment, String... names) {
        PropertySource<?> sysEnv = environment.getPropertySources().get("systemEnvironment");
        if (sysEnv == null) {
            return null;
        }
        for (String name : names) {
            Object value = sysEnv.getProperty(name);
            if (value != null && !String.valueOf(value).isBlank()) {
                return String.valueOf(value);
            }
        }
        return null;
    }

    private String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    @Override
    public int getOrder() {
        // Chạy ngay sau khi load application.yml / .env (ConfigData = HIGHEST + 10)
        // để ghi đè spring.datasource.* đã resolve
        return Ordered.HIGHEST_PRECEDENCE + 11;
    }
}
