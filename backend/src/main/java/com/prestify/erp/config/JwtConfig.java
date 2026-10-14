package com.prestify.erp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

/** Configura a assinatura e a validação dos tokens JWT do Prestify. */
@Configuration
public class JwtConfig {

    public static final String EMISSOR = "prestify-erp";

    private final SecretKey chave;

    public JwtConfig(@Value("${PRESTIFY_JWT_SECRET:}") String segredoBase64) {
        if (segredoBase64.isBlank()) {
            throw new IllegalStateException(
                "Configure a variável PRESTIFY_JWT_SECRET para iniciar o backend."
            );
        }

        byte[] segredo;

        try {
            segredo = Base64.getDecoder().decode(segredoBase64.trim());
        } catch (IllegalArgumentException excecao) {
            throw new IllegalStateException(
                "PRESTIFY_JWT_SECRET deve conter uma chave em Base64."
            );
        }

        if (segredo.length < 32) {
            throw new IllegalStateException(
                "A chave JWT deve conter pelo menos 32 bytes antes da codificação Base64."
            );
        }

        this.chave = new SecretKeySpec(segredo, "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return NimbusJwtEncoder.withSecretKey(chave)
            .algorithm(MacAlgorithm.HS256)
            .build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(chave)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();

        decoder.setJwtValidator(
            JwtValidators.createDefaultWithIssuer(EMISSOR)
        );

        return decoder;
    }
}