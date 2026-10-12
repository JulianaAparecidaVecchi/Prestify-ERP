package com.prestify.erp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Libera o frontend (Vite, porta 5173) a chamar a API pelo navegador.
 *
 * Para liberar outros endereços (ex.: produção), defina no application.properties:
 *   prestify.cors.origens=http://localhost:5173,https://app.prestify.com.br
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${prestify.cors.origens:http://localhost:5173}")
    private String[] origensPermitidas;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(origensPermitidas)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
