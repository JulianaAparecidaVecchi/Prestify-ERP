package com.prestify.erp.controller;

import com.prestify.erp.dto.estoque.*;
import com.prestify.erp.service.EstoqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class EstoqueController {
    private final EstoqueService estoqueService;

    @GetMapping("/resumo")
    public ResumoEstoqueResponseDTO obterResumo(@RequestParam Long organizacaoId) {
        return estoqueService.obterResumo(organizacaoId);
    }

    @PostMapping("/produtos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponseDTO cadastrarProduto(@Valid @RequestBody ProdutoRequestDTO dados,
            @RequestParam Long organizacaoId) {
        return estoqueService.cadastrarProduto(dados, organizacaoId);
    }

    @GetMapping("/produtos")
    public List<ProdutoResponseDTO> listarProdutos(@RequestParam Long organizacaoId) {
        return estoqueService.listarProdutos(organizacaoId);
    }

    @GetMapping("/produtos/{id}")
    public ProdutoResponseDTO buscarProduto(@PathVariable Long id, @RequestParam Long organizacaoId) {
        return estoqueService.buscarProduto(id, organizacaoId);
    }

    @PutMapping("/produtos/{id}")
    public ProdutoResponseDTO atualizarProduto(@PathVariable Long id,
            @Valid @RequestBody ProdutoRequestDTO dados, @RequestParam Long organizacaoId) {
        return estoqueService.atualizarProduto(id, dados, organizacaoId);
    }

    @DeleteMapping("/produtos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirProduto(@PathVariable Long id, @RequestParam Long organizacaoId) {
        estoqueService.excluirProduto(id, organizacaoId);
    }

    @PostMapping("/movimentacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoResponseDTO registrarMovimentacao(@Valid @RequestBody MovimentacaoRequestDTO dados,
            @RequestParam Long organizacaoId) {
        return estoqueService.registrarMovimentacao(dados, organizacaoId);
    }

    @GetMapping("/movimentacoes")
    public List<MovimentacaoResponseDTO> listarMovimentacoes(@RequestParam Long organizacaoId,
            @RequestParam(required = false) Long produtoId) {
        return estoqueService.listarMovimentacoes(organizacaoId, produtoId);
    }
}
