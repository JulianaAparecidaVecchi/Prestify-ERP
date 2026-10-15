package com.prestify.erp.template;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.entity.Categoria;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.enums.TipoCategoria;
import com.prestify.erp.enums.TipoPrecoServico;
import com.prestify.erp.exception.ServicoRegraException;
import com.prestify.erp.repository.CategoriaRepository;
import com.prestify.erp.repository.ServicoRepository;

/** Template Method: mantém a ordem comum das etapas de cadastro e atualização. */
public abstract class ServicoProcessor {
    private final ServicoRepository servicoRepository;
    private final CategoriaRepository categoriaRepository;

    protected ServicoProcessor(ServicoRepository servicoRepository, CategoriaRepository categoriaRepository) {
        this.servicoRepository = servicoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public final Servico processar(Servico servico, ServicoRequestDTO dados, Long organizacaoId, Long idAtual) {
        validarPreco(dados);
        validarCodigoOpcional(dados.getCodigo(), organizacaoId, idAtual);
        Categoria categoria = categoriaRepository.findByIdAndOrganizacaoId(dados.getCategoriaId(), organizacaoId)
                .orElseThrow(() -> new ServicoRegraException("A categoria selecionada não existe nesta organização."));
        if (categoria.getTipo() != TipoCategoria.SERVICO) {
            throw new ServicoRegraException("Selecione uma categoria do tipo Serviço.");
        }
        servico.setOrganizacaoId(organizacaoId);
        servico.setCodigo(dados.getCodigo() == null || dados.getCodigo().isBlank() ? null : dados.getCodigo().trim());
        servico.setNome(dados.getNome().trim());
        servico.setDescricao(dados.getDescricao() == null || dados.getDescricao().isBlank() ? null : dados.getDescricao().trim());
        servico.setDuracaoEstimada(dados.getDuracaoEstimada());
        servico.setCategoria(categoria);
        aplicarPreco(servico, dados);
        return servico;
    }

    public abstract TipoPrecoServico getTipoPreco();

    protected abstract void validarPreco(ServicoRequestDTO dados);

    protected abstract void aplicarPreco(Servico servico, ServicoRequestDTO dados);

    private void validarCodigoOpcional(String codigo, Long organizacaoId, Long idAtual) {
        if (codigo == null || codigo.isBlank()) return;
        String normalizado = codigo.trim();
        boolean duplicado = idAtual == null
                ? servicoRepository.existsByCodigoIgnoreCaseAndOrganizacaoId(normalizado, organizacaoId)
                : servicoRepository.existsByCodigoIgnoreCaseAndOrganizacaoIdAndIdNot(normalizado, organizacaoId, idAtual);
        if (duplicado) throw new ServicoRegraException("Já existe um serviço com esse código nesta organização.");
    }
}
