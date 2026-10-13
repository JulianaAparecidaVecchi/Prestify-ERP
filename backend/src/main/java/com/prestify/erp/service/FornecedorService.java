package com.prestify.erp.service;

import com.prestify.erp.dto.fornecedor.FornecedorRequestDTO;
import com.prestify.erp.dto.fornecedor.FornecedorResponseDTO;
import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.factory.FornecedorFactory;
import com.prestify.erp.repository.FornecedorRepository;
import com.prestify.erp.template.FornecedorProcessor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final Map<TipoPessoa, FornecedorFactory> factories = new EnumMap<>(TipoPessoa.class);
    private final Map<TipoPessoa, FornecedorProcessor> processors = new EnumMap<>(TipoPessoa.class);

    public FornecedorService(
            FornecedorRepository fornecedorRepository,
            List<FornecedorFactory> listaFactories,
            List<FornecedorProcessor> listaProcessors) {

        this.fornecedorRepository = fornecedorRepository;
        listaFactories.forEach(f -> factories.put(f.getTipoPessoa(), f));
        listaProcessors.forEach(p -> processors.put(p.getTipoPessoa(), p));
    }

    @Transactional
    public FornecedorResponseDTO cadastrar(FornecedorRequestDTO dados, Long organizacaoId) {
        TipoPessoa tipo = dados.getTipoPessoa();

        // Factory Method
        Fornecedor fornecedor = obterFactory(tipo).criar(organizacaoId);

        // Template Method
        obterProcessor(tipo).processar(fornecedor, dados, organizacaoId, null);

        return converterParaResponse(fornecedorRepository.save(fornecedor));
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listar(Long organizacaoId) {
        return fornecedorRepository
            .findAllByOrganizacaoId(organizacaoId)
            .stream()
            .map(this::converterParaResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public FornecedorResponseDTO buscarPorId(Long id, Long organizacaoId) {
        return converterParaResponse(buscarFornecedor(id, organizacaoId));
    }

    @Transactional
    public FornecedorResponseDTO atualizar(
            Long id,
            FornecedorRequestDTO dados,
            Long organizacaoId) {

        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);

        if (fornecedor.getTipoPessoa() != dados.getTipoPessoa()) {
            throw new IllegalArgumentException(
                "Não é possível alterar o tipo de pessoa do fornecedor."
            );
        }

        // Template Method
        obterProcessor(fornecedor.getTipoPessoa()).processar(fornecedor, dados, organizacaoId, id);

        return converterParaResponse(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public void inativar(Long id, Long organizacaoId) {
        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);
        fornecedor.setAtivo(false);
        fornecedorRepository.save(fornecedor);
    }

    @Transactional
    public FornecedorResponseDTO reativar(Long id, Long organizacaoId) {
        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);
        fornecedor.setAtivo(true);
        return converterParaResponse(fornecedorRepository.save(fornecedor));
    }

    private FornecedorFactory obterFactory(TipoPessoa tipo) {
        FornecedorFactory factory = factories.get(tipo);
        if (factory == null) {
            throw new IllegalArgumentException("Tipo de pessoa inválido.");
        }
        return factory;
    }

    private FornecedorProcessor obterProcessor(TipoPessoa tipo) {
        FornecedorProcessor processor = processors.get(tipo);
        if (processor == null) {
            throw new IllegalArgumentException("Tipo de pessoa inválido.");
        }
        return processor;
    }

    private Fornecedor buscarFornecedor(Long id, Long organizacaoId) {
        return fornecedorRepository
            .findByIdAndOrganizacaoId(id, organizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
    }

    @Transactional
    public void excluir(Long id, Long organizacaoId) {
        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);
        fornecedorRepository.delete(fornecedor);
    }

    private FornecedorResponseDTO converterParaResponse(Fornecedor fornecedor) {
        return obterProcessor(fornecedor.getTipoPessoa()).converterParaResponse(fornecedor);
    }
}