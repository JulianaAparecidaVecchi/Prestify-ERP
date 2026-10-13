package com.prestify.erp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class ServicoExceptionHandler {
    @ExceptionHandler(ServicoRegraException.class)
    public ResponseEntity<Map<String, String>> tratarRegra(ServicoRegraException exception) {
        HttpStatus status = exception.getMessage().contains("não encontrado") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("mensagem", exception.getMessage()));
    }
}
