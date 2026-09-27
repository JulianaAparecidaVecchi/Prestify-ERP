package com.prestify.erp.fornecedor;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    private final FornecedorService service;

    public FornecedorController(FornecedorService service) {
        this.service = service;
    }

    @GetMapping
    public List<FornecedorDTO> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public FornecedorDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FornecedorDTO cadastrar(@Valid @RequestBody FornecedorDTO dto) {
        return service.cadastrar(dto);
    }

    @PutMapping("/{id}")
    public FornecedorDTO atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        service.remover(id);
    }
}