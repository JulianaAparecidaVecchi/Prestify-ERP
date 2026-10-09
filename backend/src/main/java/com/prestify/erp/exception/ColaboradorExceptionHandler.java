package com.prestify.erp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.prestify.erp.exception.ColaboradorExceptions.ColaboradorNaoEncontradoException;
import com.prestify.erp.exception.ColaboradorExceptions.DadosInvalidosException;
import com.prestify.erp.exception.ColaboradorExceptions.EmailJaCadastradoException;

import static com.prestify.erp.exception.ColaboradorExceptions.*;

import java.util.Map;

/** Mesmo formato do CategoriaExceptionHandler: {"mensagem": "..."} (fluxo E6 do UC6). */
@RestControllerAdvice(basePackages = "com.prestify.erp.colaborador")
public class ColaboradorExceptionHandler {

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<Map<String, String>> emailDuplicado(EmailJaCadastradoException e) {
        return resposta(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(ColaboradorNaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> naoEncontrado(ColaboradorNaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(DadosInvalidosException.class)
    public ResponseEntity<Map<String, String>> invalido(DadosInvalidosException e) {
        return resposta(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacao(MethodArgumentNotValidException e) {
        String mensagem = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(erro -> erro.getDefaultMessage())
                .orElse("Dados inválidos.");
        return resposta(HttpStatus.BAD_REQUEST, mensagem);
    }

    private ResponseEntity<Map<String, String>> resposta(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("mensagem", mensagem));
    }
}
