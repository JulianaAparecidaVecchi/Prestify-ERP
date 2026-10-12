package com.prestify.erp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.prestify.erp.exception.CategoriaExceptions.CategoriaDuplicadaException;
import com.prestify.erp.exception.CategoriaExceptions.CategoriaNaoEncontradaException;

import java.util.Map;

/**
 * Todas as respostas de erro seguem o formato {"mensagem": "..."},
 * que é o que o frontend exibe na tela.
 */
@RestControllerAdvice
public class CategoriaExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarErroDeValidacao(
            IllegalArgumentException exception) {

        return resposta(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(CategoriaNaoEncontradaException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrada(
            CategoriaNaoEncontradaException exception) {

        return resposta(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(CategoriaDuplicadaException.class)
    public ResponseEntity<Map<String, String>> tratarDuplicada(
            CategoriaDuplicadaException exception) {

        return resposta(HttpStatus.CONFLICT, exception.getMessage());
    }

    /** Erros das anotações @Valid do DTO (ex.: "O nome da categoria é obrigatório."). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarCamposInvalidos(
            MethodArgumentNotValidException exception) {

        String mensagem = exception.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(erro -> erro.getDefaultMessage())
            .orElse("Dados inválidos.");

        return resposta(HttpStatus.BAD_REQUEST, mensagem);
    }

    private ResponseEntity<Map<String, String>> resposta(
            HttpStatus status,
            String mensagem) {

        return ResponseEntity.status(status).body(Map.of("mensagem", mensagem));
    }
}
