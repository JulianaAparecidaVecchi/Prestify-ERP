package com.prestify.erp.service;

import com.prestify.erp.dto.servico.ServicoResponseDTO;
import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.dto.servico.ServicoVariacaoResponseDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.entity.ServicoVariacao;
import com.prestify.erp.exception.ServicoRegraException;
import com.prestify.erp.repository.ServicoRepository;
import com.prestify.erp.template.ServicoProcessor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ServicoService {
    private final ServicoRepository repository;
    private final ServicoProcessor processor;

    public ServicoService(ServicoRepository repository, ServicoProcessor processor) {
        this.repository = repository;
        this.processor = processor;
    }

    @Transactional
    public ServicoResponseDTO cadastrar(ServicoRequestDTO dados, Long organizacaoId) {
        Servico servico = processor.processar(new Servico(), dados, organizacaoId, null);
        return converter(repository.save(servico));
    }

    @Transactional(readOnly = true)
    public List<ServicoResponseDTO> listar(Long organizacaoId) {
        return repository.findAllByOrganizacaoIdOrderByNomeAsc(organizacaoId)
                .stream().map(this::converter).toList();
    }

    @Transactional(readOnly = true)
    public ServicoResponseDTO buscar(Long id, Long organizacaoId) {
        return converter(buscarEntidade(id, organizacaoId));
    }

    @Transactional
    public ServicoResponseDTO atualizar(Long id, ServicoRequestDTO dados, Long organizacaoId) {
        Servico servico = buscarEntidade(id, organizacaoId);
        processor.processar(servico, dados, organizacaoId, id);
        return converter(repository.save(servico));
    }

    @Transactional
    public void excluir(Long id, Long organizacaoId) {
        repository.delete(buscarEntidade(id, organizacaoId));
    }

    private Servico buscarEntidade(Long id, Long organizacaoId) {
        return repository.findByIdAndOrganizacaoId(id, organizacaoId)
                .orElseThrow(() -> new ServicoRegraException("Serviço não encontrado nesta organização."));
    }

    private ServicoResponseDTO converter(Servico servico) {
        List<ServicoVariacaoResponseDTO> variacoes = servico.getVariacoes().stream()
                .map(this::converterVariacao).toList();
        return new ServicoResponseDTO(servico.getId(), servico.getCodigo(), servico.getNome(),
                servico.getDescricao(), servico.getDuracaoEstimada(), servico.getCategoria().getId(),
                servico.getCategoria().getNome(), servico.getTipoPreco(),
                servico.getPrecoUnico() == null ? null : servico.getPrecoUnico().getPreco(),
                variacoes, servico.isAtivo());
    }

    private ServicoVariacaoResponseDTO converterVariacao(ServicoVariacao variacao) {
        return new ServicoVariacaoResponseDTO(variacao.getId(), variacao.getNome(),
                variacao.getDescricao(), variacao.getPreco());
    }
}
