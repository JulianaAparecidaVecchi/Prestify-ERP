package com.prestify.erp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * TEMPORÁRIO: libera todas as rotas enquanto o login (JWT) não existe.
     *
     * Sem isto, o Spring Security bloqueia a API e redireciona para a tela
     * "Please sign in", e o frontend não consegue receber os dados.
     *
     * - cors: usa as origens liberadas no CorsConfig.
     * - csrf desligado: a API é consumida por um frontend separado (sem cookies de sessão).
     *
     * TODO: quando o login existir, trocar permitAll por regras reais
     * (ex.: autenticar /api/** e liberar só o endpoint de login).
     * NÃO usar em produção como está.
     */
    @Bean
    public SecurityFilterChain filtroDeSeguranca(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(autorizacao -> autorizacao.anyRequest().permitAll());

        return http.build();
    }
}