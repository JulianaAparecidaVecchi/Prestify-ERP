package com.prestify.erp.dto.auth;

import com.prestify.erp.enums.Funcao;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

/** Resultado de um login bem-sucedido, sem senha ou hash da conta. */
@Getter
@AllArgsConstructor
public class LoginResponseDTO {

    private final String token;

    private final String tipoToken;

    private final Instant expiraEm;

    private final Long colaboradorId;

    private final Long organizacaoId;

    private final String nome;

    private final String email;

    private final Funcao funcao;
}