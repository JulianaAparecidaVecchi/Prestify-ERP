package com.prestify.erp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.prestify.erp.dto.colaborador.ColaboradorRequestDTO;
import com.prestify.erp.dto.colaborador.ColaboradorResponseDTO;
import com.prestify.erp.service.ColaboradorService;

import java.util.List;

/**
 * UC6 - Gerenciar usuário (colaboradores da organização).
 * Mesmo padrão do CategoriaController: organizacaoId por parâmetro.
 *
 * TODO (quando o SecurityConfig/JWT estiver no projeto): restringir ao
 * Administrador com @PreAuthorize("hasRole('ADMINISTRADOR')") e passar a
 * ler a organização do token em vez do parâmetro.
 */
@RestController
@RequestMapping("/api/colaboradores")
@RequiredArgsConstructor
public class ColaboradorController {

    private final ColaboradorService colaboradorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ColaboradorResponseDTO cadastrar(
            @Valid @RequestBody ColaboradorRequestDTO dados,
            @RequestParam Long organizacaoId) {

        return colaboradorService.cadastrar(dados, organizacaoId);
    }

    @GetMapping
    public List<ColaboradorResponseDTO> listar(@RequestParam Long organizacaoId) {
        return colaboradorService.listar(organizacaoId);
    }

    @GetMapping("/{id}")
    public ColaboradorResponseDTO buscarPorId(
            @PathVariable Long id,
            @RequestParam Long organizacaoId) {

        return colaboradorService.buscarPorId(id, organizacaoId);
    }

    @PutMapping("/{id}")
    public ColaboradorResponseDTO atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ColaboradorRequestDTO dados,
            @RequestParam Long organizacaoId) {

        return colaboradorService.atualizar(id, dados, organizacaoId);
    }

    @PatchMapping("/{id}/status")
    public ColaboradorResponseDTO alterarStatus(
            @PathVariable Long id,
            @RequestParam boolean ativo,
            @RequestParam Long organizacaoId) {

        return colaboradorService.alterarStatus(id, ativo, organizacaoId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(
            @PathVariable Long id,
            @RequestParam Long organizacaoId) {

        colaboradorService.excluir(id, organizacaoId);
    }
}
