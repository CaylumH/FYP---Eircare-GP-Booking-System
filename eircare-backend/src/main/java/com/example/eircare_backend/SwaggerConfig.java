package com.example.eircare_backend;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI eircareOpenAPI() {

        return new OpenAPI()
            .info(new Info()
                .title("Eircare GP Booking API")
                .description(

                    "REST API for the Eircare GP booking system. " +
                    "This is designed for future integration with GP patient management systems like Socrates and Health One " +
                    "via webhook callbacks and standard REST endpoints. " +
                    "All appointment events will be sent to a configurable webhook URL (webhook.url in application.properties)."
                )
                .version("1.0.0")
                .contact(new Contact()
                    .name("Eircare")
                    .email("caylumhurley@gmali.com")));
    }

}
