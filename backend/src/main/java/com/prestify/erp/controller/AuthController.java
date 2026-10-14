package com.prestify.erp.controller;

import com.prestify.erp.dto.auth.LoginRequestDTO;
import com.prestify.erp.dto.auth.LoginResponseDTO;
import com.prestify.erp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** API de autenticação de contas previamente cadastradas. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO dados) {

        LoginResponseDTO resposta = service.login(dados);

        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(resposta);
    }
}