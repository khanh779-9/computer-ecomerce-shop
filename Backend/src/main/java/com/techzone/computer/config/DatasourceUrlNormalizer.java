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

            String username = firstNonBlank(
                    environment.getProperty("DB_USERNAME"),
                    extractUserFromUrl(url)
            );
            if (username != null) {
                overrides.put(DATASOURCE_USERNAME, username);
            }
            String password = firstNonBlank(
                    environment.getProperty("DB_PASSWORD"),
                    extractPasswordFromUrl(url)
            );
            if (password != null) {
                overrides.put(DATASOURCE_PASSWORD, password);
            }
        }

        if (!overrides.isEmpty()) {
            environment.getPropertySources().addFirst(
                    new MapPropertySource("techzoneDatasourceNormalizer", overrides)
            );
        }
    }

    private String normalizeJdbcUrl(String url) {
        if (url.startsWith("jdbc:")) {
            return url;
        }
        // postgresql://host/db hoặc postgres://host/db -> jdbc:postgresql://host/db
        if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
            return "jdbc:postgresql://" + url.substring(url.indexOf("://") + 3);
        }
        return "jdbc:" + url;
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
