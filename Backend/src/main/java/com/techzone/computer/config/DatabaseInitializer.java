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
        log.info("[DB-Init] Checking and applying database schema (V1__schema.sql)...");
        ResourceDatabasePopulator schemaPopulator = new ResourceDatabasePopulator(
            false,
            false,
            StandardCharsets.UTF_8.name(),
            new ClassPathResource("db/migration/V1__schema.sql")
        );
        schemaPopulator.execute(dataSource);

        log.info("[DB-Init] Populating/Updating seed data (V2__seed_products.sql)...");
        ResourceDatabasePopulator seedPopulator = new ResourceDatabasePopulator(
            false,
            false,
            StandardCharsets.UTF_8.name(),
            new ClassPathResource("db/migration/V2__seed_products.sql")
        );
        seedPopulator.execute(dataSource);

        log.info("[DB-Init] Applying schema refactor (V3__schema_refactor.sql)...");
        ResourceDatabasePopulator refactorPopulator = new ResourceDatabasePopulator(
            false,
            false,
            StandardCharsets.UTF_8.name(),
            new ClassPathResource("db/migration/V3__schema_refactor.sql")
        );
        refactorPopulator.execute(dataSource);

        log.info("[DB-Init] Applying admin and catalog schema (V4__admin_and_catalog_refactor.sql)...");
        ResourceDatabasePopulator adminSchemaPopulator = new ResourceDatabasePopulator(
            false,
            false,
            StandardCharsets.UTF_8.name(),
            new ClassPathResource("db/migration/V4__admin_and_catalog_refactor.sql")
        );
        adminSchemaPopulator.execute(dataSource);

        log.info("[DB-Init] Applying customer, warranty, and media schema (V5__customer_warranty_and_media.sql)...");
        ResourceDatabasePopulator customerSchemaPopulator = new ResourceDatabasePopulator(
            false,
            false,
            StandardCharsets.UTF_8.name(),
            new ClassPathResource("db/migration/V5__customer_warranty_and_media.sql")
        );
        customerSchemaPopulator.execute(dataSource);

        log.info("[DB-Init] Seeding warranty demo data (V6__seed_warranty.sql)...");
        ResourceDatabasePopulator warrantySeedPopulator = new ResourceDatabasePopulator(
            false,
            false,
            StandardCharsets.UTF_8.name(),
            new ClassPathResource("db/migration/V6__seed_warranty.sql")
        );
        warrantySeedPopulator.execute(dataSource);

        log.info("[DB-Init] Database initialization and seed completed successfully with UTF-8.");
    }
}
