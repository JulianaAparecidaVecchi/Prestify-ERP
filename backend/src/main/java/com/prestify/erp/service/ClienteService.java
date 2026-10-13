package com.prestify.erp.service;

import com.prestify.erp.dto.cliente.ClienteRequestDTO;
import com.prestify.erp.dto.cliente.ClienteResponseDTO;
import com.prestify.erp.dto.cliente.ClienteStatusRequestDTO;
import com.prestify.erp.dto.endereco.EnderecoDTO;
import com.prestify.erp.entity.Cliente;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.exception.ClienteExceptions.ClienteNaoEncontradoException;
import com.prestify.erp.exception.ClienteExceptions.DadosInvalidosException;
import com.prestify.erp.repository.ClienteRepository;
import com.prestify.erp.template.ClientePFProcessor;
import com.prestify.erp.template.ClientePJProcessor;
import com.prestify.erp.template.ClienteProcessor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Coordena as operações do módulo de clientes.
 * Singleton gerenciado pelo Spring: uma instância deste bean por contexto.
 * Os dados de cada requisição ficam em parâmetros e variáveis locais.
 */
@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final ClientePFProcessor pfProcessor;
    private final ClientePJProcessor pjProcessor;

    public ClienteService(
            ClienteRepository repository,
            ClientePFProcessor pfProcessor,
            ClientePJProcessor pjProcessor) {

        this.repository = repository;
        this.pfProcessor = pfProcessor;
        this.pjProcessor = pjProcessor;
    }

    @Transactional
    public ClienteResponseDTO cadastrar(ClienteRequestDTO dados, Long organizacaoId) {
        validarOrganizacao(organizacaoId);
        ClienteProcessor processor = selecionarProcessor(dados);
        Cliente cliente = processor.processar(new Cliente(), dados, organizacaoId, null);
        return converter(repository.saveAndFlush(cliente));
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscar(Long id, Long organizacaoId) {
        return converter(buscarEntidade(id, organizacaoId));
    }

    @Transactional
    public ClienteResponseDTO atualizar(
            Long id, ClienteRequestDTO dados, Long organizacaoId) {

        Cliente cliente = buscarEntidade(id, organizacaoId);
        ClienteProcessor processor = selecionarProcessor(dados);
        processor.processar(cliente, dados, organizacaoId, id);
        return converter(repository.saveAndFlush(cliente));
    }

    @Transactional
    public ClienteResponseDTO alterarStatus(
            Long id, ClienteStatusRequestDTO dados, Long organizacaoId) {

        Cliente cliente = buscarEntidade(id, organizacaoId);
        if (dados == null || dados.getAtivo() == null) {
            throw new DadosInvalidosException("Informe se o cliente deve ficar ativo ou inativo.");
        }

        cliente.setAtivo(dados.getAtivo());
        return converter(repository.saveAndFlush(cliente));
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponseDTO> listar(
            Long organizacaoId,
            String busca,
            TipoPessoa tipoPessoa,
            Boolean ativo,
            String estado,
            int pagina,
            int tamanho) {

        validarOrganizacao(organizacaoId);
        if (pagina < 0) {
            throw new DadosInvalidosException("A página deve ser maior ou igual a zero.");
        }
        if (tamanho < 1 || tamanho > 100) {
            throw new DadosInvalidosException("A quantidade por página deve estar entre 1 e 100.");
        }

        String buscaNormalizada = normalizarBusca(busca);
        return repository.buscarComFiltros(
            organizacaoId,
            buscaNormalizada,
            normalizarDocumentoBusca(buscaNormalizada),
            tipoPessoa,
            ativo,
            normalizarEstado(estado),
            PageRequest.of(pagina, tamanho)
        ).map(this::converter);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarParaExportacao(
            Long organizacaoId,
            String busca,
            TipoPessoa tipoPessoa,
            Boolean ativo,
            String estado) {

        validarOrganizacao(organizacaoId);
        String buscaNormalizada = normalizarBusca(busca);
        return repository.buscarParaExportacao(
            organizacaoId,
            buscaNormalizada,
            normalizarDocumentoBusca(buscaNormalizada),
            tipoPessoa,
            ativo,
            normalizarEstado(estado)
        ).stream().map(this::converter).toList();
    }

    private Cliente buscarEntidade(Long id, Long organizacaoId) {
        validarOrganizacao(organizacaoId);
        if (id == null || id <= 0) {
            throw new DadosInvalidosException("Informe um identificador de cliente válido.");
        }

        return repository.findByIdAndOrganizacaoId(id, organizacaoId)
            .orElseThrow(ClienteNaoEncontradoException::new);
    }

    private ClienteProcessor selecionarProcessor(ClienteRequestDTO dados) {
        if (dados == null || dados.getTipoPessoa() == null) {
            throw new DadosInvalidosException("Selecione o tipo de cliente.");
        }

        return switch (dados.getTipoPessoa()) {
            case FISICA -> pfProcessor;
            case JURIDICA -> pjProcessor;
        };
    }

    private void validarOrganizacao(Long organizacaoId) {
        if (organizacaoId == null || organizacaoId <= 0) {
            throw new DadosInvalidosException("Informe uma organização válida.");
        }
    }

    private String normalizarBusca(String busca) {
        if (busca == null || busca.isBlank()) {
            return null;
        }
        String texto = busca.trim();
        if (texto.length() > 150) {
            throw new DadosInvalidosException("A busca deve ter no máximo 150 caracteres.");
        }
        return texto;
    }

    private String normalizarDocumentoBusca(String busca) {
        return busca == null ? "" : busca.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
    }

    private String normalizarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return null;
        }
        String uf = estado.trim().toUpperCase(Locale.ROOT);
        if (!uf.matches("[A-Z]{2}")) {
            throw new DadosInvalidosException("Informe o estado usando uma UF de duas letras.");
        }
        return uf;
    }

    private ClienteResponseDTO converter(Cliente cliente) {
        return new ClienteResponseDTO(
            cliente.getId(),
            cliente.getTipoPessoa(),
            cliente.getNome(),
            cliente.getCpf(),
            cliente.getCnpj(),
            cliente.getDataNascimento(),
            cliente.getGenero(),
            cliente.getEmail(),
            cliente.getTelefone(),
            EnderecoDTO.fromEntity(cliente.getEndereco()),
            cliente.isAtivo(),
            cliente.getDataCriacao(),
            cliente.getDataAtualizacao()
        );
    }
}