package com.prestify.erp.config;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Configura o acesso às APIs por token JWT e organização autenticada. */
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filtroDeSeguranca(HttpSecurity http) throws Exception {
        JwtGrantedAuthoritiesConverter funcoes = new JwtGrantedAuthoritiesConverter();
        funcoes.setAuthoritiesClaimName("funcao");
        funcoes.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(funcoes);

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sessao ->
                sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .requestCache(cache -> cache.disable())
            .formLogin(formulario -> formulario.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable())
            .authorizeHttpRequests(autorizacao -> autorizacao
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll()
            )
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(conversor))
                .authenticationEntryPoint((request, response, exception) ->
                    responder(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Sessão inválida ou expirada. Faça login novamente.")
                )
                .accessDeniedHandler((request, response, exception) ->
                    responder(response, HttpServletResponse.SC_FORBIDDEN,
                        "Você não tem permissão para acessar este recurso.")
                )
            )
            .exceptionHandling(excecoes -> excecoes
                .authenticationEntryPoint((request, response, exception) ->
                    responder(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Faça login para acessar o sistema.")
                )
                .accessDeniedHandler((request, response, exception) ->
                    responder(response, HttpServletResponse.SC_FORBIDDEN,
                        "Você não tem permissão para acessar este recurso.")
                )
            )
            .addFilterAfter(
                new OrganizacaoFilter(),
                BearerTokenAuthenticationFilter.class
            );

        return http.build();
    }

    private void responder(HttpServletResponse response, int status,
                           String mensagem) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        response.setHeader("Cache-Control", "no-store");

        if (status == HttpServletResponse.SC_UNAUTHORIZED) {
            response.setHeader("WWW-Authenticate", "Bearer");
        }

        response.getWriter().write("{\"mensagem\":\"" + mensagem + "\"}");
    }
}