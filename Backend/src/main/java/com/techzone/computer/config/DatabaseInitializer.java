package com.techzone.computer.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;

/**
 * Automatically ensures DB schema and UTF-8 seed data are populated on startup.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        try {
            log.info("[DB-Init] Checking and applying database schema (V1__schema.sql)...");
            ResourceDatabasePopulator schemaPopulator = new ResourceDatabasePopulator(
                true, // continueOnError = true
                false, // ignoreFailedDrops
                StandardCharsets.UTF_8.name(),
                new ClassPathResource("db/migration/V1__schema.sql")
            );
            schemaPopulator.execute(dataSource);

            log.info("[DB-Init] Populating/Updating seed data (V2__seed_products.sql)...");
            ResourceDatabasePopulator seedPopulator = new ResourceDatabasePopulator(
                true,
                false,
                StandardCharsets.UTF_8.name(),
                new ClassPathResource("db/migration/V2__seed_products.sql")
            );
            seedPopulator.execute(dataSource);

            log.info("[DB-Init] Database initialization and seed completed successfully with UTF-8.");
        } catch (Exception e) {
            log.warn("[DB-Init] Database initialization notice: {}", e.getMessage());
        }
    }
}
