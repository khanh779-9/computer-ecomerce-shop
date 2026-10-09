package com.techzone.computer.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean
    public MinioClient minioClient(
            @Value("${MINIO_ENDPOINT:http://localhost:9000}") String endpoint,
            @Value("${MINIO_ACCESS_KEY:minioadmin}") String accessKey,
            @Value("${MINIO_SECRET_KEY:minioadmin}") String secretKey
    ) {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
