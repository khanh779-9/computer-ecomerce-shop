package com.techzone.computer.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

import java.util.HashMap;
import java.util.Map;


public class DatasourceUrlNormalizer implements EnvironmentPostProcessor, Ordered {

    private static final String DATASOURCE_URL = "spring.datasource.url";
    private static final String DATASOURCE_USERNAME = "spring.datasource.username";
    private static final String DATASOURCE_PASSWORD = "spring.datasource.password";

      public static void applyAsSystemProperties() {
        String url = firstNonBlank(System.getenv("DB_URL"), System.getenv("DATABASE_URL"));
        System.out.println("[DB-Normalizer] >>> running in main() | DB_URL present=" +
                (url != null && !url.isBlank()) + (url != null ? " (len=" + url.length() + ")" : ""));

        if (url != null && !url.isBlank()) {
            String normalizedUrl = normalizeJdbcUrl(url.trim());
            System.setProperty(DATASOURCE_URL, normalizedUrl);
            System.out.println("[DB-Normalizer] resolved url: " + maskUrl(normalizedUrl));

            String username = firstNonBlank(
                    System.getenv("DB_USERNAME"),
                    System.getenv("DATABASE_USERNAME"),
                    extractUserFromUrl(url)
            );
            if (username != null) {
                System.setProperty(DATASOURCE_USERNAME, username);
                System.out.println("[DB-Normalizer] username: " + username);
            }
            String password = firstNonBlank(
                    System.getenv("DB_PASSWORD"),
                    System.getenv("DATABASE_PASSWORD"),
                    extractPasswordFromUrl(url)
            );
            if (password != null) {
                System.setProperty(DATASOURCE_PASSWORD, password);
                System.out.println("[DB-Normalizer] password: <" + password.length() + " chars>");
            }
        } else {
            System.out.println("[DB-Normalizer] DB_URL RONG/THIEU -> dung default localhost (postgres)");
            System.setProperty(DATASOURCE_URL, "jdbc:postgresql://localhost:5432/techzone_computer");
            System.setProperty(DATASOURCE_USERNAME, "postgres");
            System.setProperty(DATASOURCE_PASSWORD, "123");
        }
    }

    /** Che mật khẩu khi log URL để không lộ secret ra log deploy. */
    private static String maskUrl(String url) {
        return url.replaceAll("(password|PWD)=[^&]*", "$1=***")
                .replaceAll(":[^:@/]+@", ":***@");
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = firstNonBlank(
                environment.getProperty("DB_URL"),
                environment.getProperty("DATABASE_URL")
        );

        Map<String, Object> overrides = new HashMap<>();
        if (url != null && !url.isBlank()) {
            overrides.put(DATASOURCE_URL, normalizeJdbcUrl(url.trim()));

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
                      overrides.put(DATASOURCE_URL, "jdbc:postgresql://localhost:5432/techzone_computer");
            overrides.put(DATASOURCE_USERNAME, "postgres");
            overrides.put(DATASOURCE_PASSWORD, "123");
        }

        environment.getPropertySources().addFirst(
                new MapPropertySource("techzoneDatasourceNormalizer", overrides)
        );
    }

   
    private static String normalizeJdbcUrl(String url) {
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

        // TÃ¡ch credentials khá»i authority: user:pass@host:port/db -> host:port/db
        int at = body.lastIndexOf('@');
        if (at >= 0) {
            body = body.substring(at + 1);
        }

        String normalized = scheme + "//" + body;

        // Aiven khuyáº¿n nghá»‹ SSL â€” tá»± thÃªm sslmode=require náº¿u host aivencloud chÆ°a cÃ³
        if (normalized.contains("aivencloud.com") && !query.contains("sslmode=")) {
            query = query.isBlank() ? "sslmode=require" : query + "&sslmode=require";
        }
        if (!query.isBlank()) {
            normalized = normalized + "?" + query;
        }
        return normalized;
    }

      private static String extractUserFromUrl(String url) {
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) return null;
        String authority = url.substring(schemeEnd + 3);
        int at = authority.indexOf('@');
        if (at <= 0) return null;
        String credentials = authority.substring(0, at);
        int colon = credentials.indexOf(':');
        return colon > 0 ? credentials.substring(0, colon) : credentials;
    }

    private static String extractPasswordFromUrl(String url) {
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) return null;
        String authority = url.substring(schemeEnd + 3);
        int at = authority.indexOf('@');
        if (at <= 0) return null;
        String credentials = authority.substring(0, at);
        int colon = credentials.indexOf(':');
        return colon >= 0 ? credentials.substring(colon + 1) : null;
    }

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

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    @Override
    public int getOrder() {
              return Ordered.HIGHEST_PRECEDENCE + 11;
    }
}
