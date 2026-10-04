package com.prestify.erp.categoria;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponseDTO cadastrar(
            @Valid @RequestBody CategoriaRequestDTO dados,
            @RequestParam Long organizacaoId) {

        return categoriaService.cadastrar(dados, organizacaoId);
    }

    @GetMapping
    public List<CategoriaResponseDTO> listar(
            @RequestParam TipoCategoria tipo,
            @RequestParam Long organizacaoId) {

        return categoriaService.listar(tipo, organizacaoId);
    }

    @GetMapping("/{id}")
    public CategoriaResponseDTO buscarPorId(
            @PathVariable Long id,
            @RequestParam Long organizacaoId) {

        return categoriaService.buscarPorId(id, organizacaoId);
    }

    @PutMapping("/{id}")
    public CategoriaResponseDTO atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDTO dados,
            @RequestParam Long organizacaoId) {

        return categoriaService.atualizar(id, dados, organizacaoId);
    }
}