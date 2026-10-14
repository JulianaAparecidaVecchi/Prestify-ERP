package com.prestify.erp.service;

import com.prestify.erp.config.JwtConfig;
import com.prestify.erp.dto.auth.LoginRequestDTO;
import com.prestify.erp.dto.auth.LoginResponseDTO;
import com.prestify.erp.entity.Colaborador;
import com.prestify.erp.enums.StatusColaborador;
import com.prestify.erp.repository.ColaboradorRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

/** Autentica colaboradores existentes e emite tokens de acesso. */
@Service
public class AuthService {

    private static final Duration DURACAO_TOKEN = Duration.ofHours(1);

    private final ColaboradorRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final String hashParaComparacao;

    public AuthService(ColaboradorRepository repository,
                       PasswordEncoder passwordEncoder,
                       JwtEncoder jwtEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.hashParaComparacao = passwordEncoder.encode(
            UUID.randomUUID().toString()
        );
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dados) {
        if (dados == null || dados.getEmail() == null || dados.getEmail().isBlank()
                || dados.getSenha() == null || dados.getSenha().isBlank()) {
            throw credenciaisInvalidas();
        }

        String email = dados.getEmail().trim().toLowerCase(Locale.ROOT);
        Colaborador colaborador = repository.findByEmailIgnoreCase(email)
            .orElse(null);

        // Executa a comparação BCrypt mesmo quando o e-mail não existe.
        String hash = colaborador == null || colaborador.getSenha() == null
            ? hashParaComparacao
            : colaborador.getSenha();

        boolean senhaCorreta = passwordEncoder.matches(dados.getSenha(), hash);

        if (colaborador == null || !senhaCorreta
                || colaborador.getStatus() != StatusColaborador.ATIVO
                || colaborador.getOrganizacaoId() == null
                || colaborador.getOrganizacaoId() <= 0
                || colaborador.getFuncao() == null) {
            throw credenciaisInvalidas();
        }

        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(DURACAO_TOKEN);

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(JwtConfig.EMISSOR)
            .subject(colaborador.getId().toString())
            .issuedAt(agora)
            .expiresAt(expiraEm)
            .id(UUID.randomUUID().toString())
            .claim("organizacaoId", colaborador.getOrganizacaoId())
            .claim("funcao", colaborador.getFuncao().name())
            .build();

        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256)
            .type("JWT")
            .build();

        String token = jwtEncoder.encode(
            JwtEncoderParameters.from(cabecalho, claims)
        ).getTokenValue();

        return new LoginResponseDTO(
            token,
            "Bearer",
            expiraEm,
            colaborador.getId(),
            colaborador.getOrganizacaoId(),
            colaborador.getNomeExibicao(),
            colaborador.getEmail(),
            colaborador.getFuncao()
        );
    }

    private BadCredentialsException credenciaisInvalidas() {
        return new BadCredentialsException(
            "E-mail ou senha inválidos, ou conta indisponível."
        );
    }
}