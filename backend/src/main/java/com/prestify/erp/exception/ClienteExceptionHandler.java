package com.prestify.erp.exception;

import com.prestify.erp.exception.ClienteExceptions.ClienteNaoEncontradoException;
import com.prestify.erp.exception.ClienteExceptions.DadosInvalidosException;
import com.prestify.erp.exception.ClienteExceptions.DocumentoJaCadastradoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ClienteExceptionHandler {

    @ExceptionHandler(ClienteNaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrado(
            ClienteNaoEncontradoException exception) {

        return resposta(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(DocumentoJaCadastradoException.class)
    public ResponseEntity<Map<String, String>> tratarDocumentoDuplicado(
            DocumentoJaCadastradoException exception) {

        return resposta(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(DadosInvalidosException.class)
    public ResponseEntity<Map<String, String>> tratarDadosInvalidos(
            DadosInvalidosException exception) {

        return resposta(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    private ResponseEntity<Map<String, String>> resposta(
            HttpStatus status,
            String mensagem) {

        return ResponseEntity.status(status).body(Map.of("mensagem", mensagem));
    }
}