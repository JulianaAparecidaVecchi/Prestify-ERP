package com.prestify.erp.config;

import com.prestify.erp.entity.Colaborador;
import com.prestify.erp.enums.StatusColaborador;
import com.prestify.erp.repository.ColaboradorRepository;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Confere se a conta do token continua válida no banco de dados. */
@Component
public class ContaJwtValidator implements OAuth2TokenValidator<Jwt> {

    private final ColaboradorRepository repository;

    public ContaJwtValidator(ColaboradorRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public OAuth2TokenValidatorResult validate(Jwt token) {
        Long colaboradorId;
        Long organizacaoId;
        String funcao;

        try {
            colaboradorId = Long.valueOf(token.getSubject());
            organizacaoId = Long.valueOf(
                token.getClaimAsString("organizacaoId")
            );
            funcao = token.getClaimAsString("funcao");
        } catch (IllegalArgumentException excecao) {
            return falha();
        }

        if (colaboradorId <= 0 || organizacaoId <= 0 || funcao == null) {
            return falha();
        }

        Colaborador colaborador = repository
            .findByIdAndOrganizacaoId(colaboradorId, organizacaoId)
            .orElse(null);

        if (colaborador == null
                || colaborador.getStatus() != StatusColaborador.ATIVO
                || colaborador.getFuncao() == null
                || !colaborador.getFuncao().name().equals(funcao)) {
            return falha();
        }

        return OAuth2TokenValidatorResult.success();
    }

    private OAuth2TokenValidatorResult falha() {
        OAuth2Error erro = new OAuth2Error(
            "invalid_token",
            "A conta não está disponível para este token. Faça login novamente.",
            null
        );

        return OAuth2TokenValidatorResult.failure(erro);
    }
}