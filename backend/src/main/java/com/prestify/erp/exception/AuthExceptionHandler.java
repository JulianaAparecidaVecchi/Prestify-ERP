package com.prestify.erp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/** Converte falhas de credenciais do login em uma resposta JSON. */
@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> tratarCredenciaisInvalidas(
            BadCredentialsException exception) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of(
                "mensagem",
                "E-mail ou senha inválidos, ou conta indisponível."
            ));
    }
}