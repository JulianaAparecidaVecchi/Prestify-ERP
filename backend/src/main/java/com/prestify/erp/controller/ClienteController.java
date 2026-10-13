package com.prestify.erp.controller;

import com.prestify.erp.dto.cliente.ClienteRequestDTO;
import com.prestify.erp.dto.cliente.ClienteResponseDTO;
import com.prestify.erp.dto.cliente.ClienteStatusRequestDTO;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.service.ClienteExportacaoService;
import com.prestify.erp.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final ClienteExportacaoService exportacaoService;

    public ClienteController(ClienteService service, ClienteExportacaoService exportacaoService) {
        this.service = service;
        this.exportacaoService = exportacaoService;
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

    @GetMapping("/exportar/csv")
    public ResponseEntity<byte[]> exportarCsv(
            @RequestParam("organizacaoId") Long organizacaoId,
            @RequestParam(value = "busca", required = false) String busca,
            @RequestParam(value = "tipoPessoa", required = false) TipoPessoa tipoPessoa,
            @RequestParam(value = "ativo", required = false) Boolean ativo,
            @RequestParam(value = "estado", required = false) String estado) {

        byte[] arquivo = exportacaoService.exportarCsv(organizacaoId, busca, tipoPessoa, ativo, estado);
        return download(arquivo, "clientes.csv", MediaType.parseMediaType("text/csv;charset=UTF-8"));
    }

    @GetMapping("/exportar/pdf")
    public ResponseEntity<byte[]> exportarPdf(
            @RequestParam("organizacaoId") Long organizacaoId,
            @RequestParam(value = "busca", required = false) String busca,
            @RequestParam(value = "tipoPessoa", required = false) TipoPessoa tipoPessoa,
            @RequestParam(value = "ativo", required = false) Boolean ativo,
            @RequestParam(value = "estado", required = false) String estado) {

        byte[] arquivo = exportacaoService.exportarPdf(organizacaoId, busca, tipoPessoa, ativo, estado);
        return download(arquivo, "clientes.pdf", MediaType.APPLICATION_PDF);
    }

    private ResponseEntity<byte[]> download(byte[] arquivo, String nome, MediaType tipoConteudo) {
        return ResponseEntity.ok()
            .contentType(tipoConteudo)
            .contentLength(arquivo.length)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(nome).build().toString())
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .body(arquivo);
    }
}