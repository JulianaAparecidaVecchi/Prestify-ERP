package com.prestify.erp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Impede que uma conta autenticada solicite dados de outra organização. */
public class OrganizacaoFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String caminho = request.getServletPath();

        return "OPTIONS".equals(request.getMethod())
            || !caminho.startsWith("/api/")
            || caminho.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        var autenticacao = SecurityContextHolder.getContext().getAuthentication();

        if (!(autenticacao instanceof JwtAuthenticationToken conta)
                || !conta.isAuthenticated()) {
            responder(response, HttpServletResponse.SC_UNAUTHORIZED,
                "Faça login para acessar o sistema.");
            return;
        }

        String[] parametros = request.getParameterValues("organizacaoId");

        if (parametros == null || parametros.length != 1) {
            responder(response, HttpServletResponse.SC_BAD_REQUEST,
                "Informe um único organizacaoId válido.");
            return;
        }

        long organizacaoSolicitada;
        long organizacaoDaConta;

        try {
            organizacaoSolicitada = Long.parseLong(parametros[0]);
        } catch (NumberFormatException excecao) {
            responder(response, HttpServletResponse.SC_BAD_REQUEST,
                "Informe um organizacaoId válido.");
            return;
        }

        try {
            organizacaoDaConta = Long.parseLong(
                conta.getToken().getClaimAsString("organizacaoId")
            );
        } catch (IllegalArgumentException excecao) {
            responder(response, HttpServletResponse.SC_UNAUTHORIZED,
                "Token inválido. Faça login novamente.");
            return;
        }

        if (organizacaoSolicitada <= 0) {
            responder(response, HttpServletResponse.SC_BAD_REQUEST,
                "Informe um organizacaoId válido.");
            return;
        }

        if (organizacaoSolicitada != organizacaoDaConta) {
            responder(response, HttpServletResponse.SC_FORBIDDEN,
                "Você não tem acesso a esta organização.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void responder(HttpServletResponse response, int status,
                           String mensagem) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        response.setHeader("Cache-Control", "no-store");
        response.getWriter().write("{\"mensagem\":\"" + mensagem + "\"}");
    }
}