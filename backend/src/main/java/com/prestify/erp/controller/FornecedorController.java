package com.prestify.erp.controller;

import com.prestify.erp.dto.fornecedor.FornecedorRequestDTO;
import com.prestify.erp.dto.fornecedor.FornecedorResponseDTO;
import com.prestify.erp.service.FornecedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
@RequiredArgsConstructor
public class FornecedorController {
 
    private final FornecedorService fornecedorService;
 
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FornecedorResponseDTO cadastrar(
            @Valid @RequestBody FornecedorRequestDTO dados,
            @RequestParam Long organizacaoId) {
 
        return fornecedorService.cadastrar(dados, organizacaoId);
    }
 
    @GetMapping
    public List<FornecedorResponseDTO> listar(@RequestParam Long organizacaoId) {
        return fornecedorService.listar(organizacaoId);
    }
 
    @GetMapping("/{id}")
    public FornecedorResponseDTO buscarPorId(
            @PathVariable Long id,
            @RequestParam Long organizacaoId) {
 
        return fornecedorService.buscarPorId(id, organizacaoId);
    }
 
    @PutMapping("/{id}")
    public FornecedorResponseDTO atualizar(
            @PathVariable Long id,
            @Valid @RequestBody FornecedorRequestDTO dados,
            @RequestParam Long organizacaoId) {
 
        return fornecedorService.atualizar(id, dados, organizacaoId);
    }
 
    @PatchMapping("/{id}/inativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inativar(
            @PathVariable Long id,
            @RequestParam Long organizacaoId) {
 
        fornecedorService.inativar(id, organizacaoId);
    }
 
    @PatchMapping("/{id}/reativar")
    public FornecedorResponseDTO reativar(
            @PathVariable Long id,
            @RequestParam Long organizacaoId) {
 
        return fornecedorService.reativar(id, organizacaoId);
    }
}