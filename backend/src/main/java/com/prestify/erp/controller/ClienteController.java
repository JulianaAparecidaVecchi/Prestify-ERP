package com.prestify.erp.controller;

import com.prestify.erp.dto.cliente.ClienteRequestDTO;
import com.prestify.erp.dto.cliente.ClienteResponseDTO;
import com.prestify.erp.dto.cliente.ClienteStatusRequestDTO;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** API REST de clientes, com organização informada por parâmetro. */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponseDTO cadastrar(
            @Valid @RequestBody ClienteRequestDTO dados,
            @RequestParam("organizacaoId") Long organizacaoId) {

        return service.cadastrar(dados, organizacaoId);
    }

    @GetMapping
    public PagedModel<ClienteResponseDTO> listar(
            @RequestParam("organizacaoId") Long organizacaoId,
            @RequestParam(value = "busca", required = false) String busca,
            @RequestParam(value = "tipoPessoa", required = false) TipoPessoa tipoPessoa,
            @RequestParam(value = "ativo", required = false) Boolean ativo,
            @RequestParam(value = "estado", required = false) String estado,
            @RequestParam(value = "pagina", defaultValue = "0") int pagina,
            @RequestParam(value = "tamanho", defaultValue = "5") int tamanho) {

        return new PagedModel<>(
            service.listar(organizacaoId, busca, tipoPessoa, ativo, estado, pagina, tamanho)
        );
    }

    @GetMapping("/{id}")
    public ClienteResponseDTO buscar(
            @PathVariable("id") Long id,
            @RequestParam("organizacaoId") Long organizacaoId) {

        return service.buscar(id, organizacaoId);
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO atualizar(
            @PathVariable("id") Long id,
            @Valid @RequestBody ClienteRequestDTO dados,
            @RequestParam("organizacaoId") Long organizacaoId) {

        return service.atualizar(id, dados, organizacaoId);
    }

    @PatchMapping("/{id}/status")
    public ClienteResponseDTO alterarStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody ClienteStatusRequestDTO dados,
            @RequestParam("organizacaoId") Long organizacaoId) {

        return service.alterarStatus(id, dados, organizacaoId);
    }
}