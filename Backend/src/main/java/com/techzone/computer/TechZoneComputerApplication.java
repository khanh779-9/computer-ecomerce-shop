package com.techzone.computer;

import com.techzone.computer.config.DatasourceUrlNormalizer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TechZoneComputerApplication {

    public static void main(String[] args) {
             DatasourceUrlNormalizer.applyAsSystemProperties();
        SpringApplication.run(TechZoneComputerApplication.class, args);
    }
}
