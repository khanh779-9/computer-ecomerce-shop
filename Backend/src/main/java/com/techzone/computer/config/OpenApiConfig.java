package com.techzone.computer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI computerShopOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TechZone Computer E-commerce API")
                        .description("REST API cho ná»n táº£ng bÃ¡n láº» mÃ¡y tÃ­nh & linh kiá»‡n (Products, Orders, Cart, Reviews)")
                        .version("1.0.0")
                        .contact(new Contact().name("TechZone Computer").email("contact@techzonecomputer.vn")));
    }
}
