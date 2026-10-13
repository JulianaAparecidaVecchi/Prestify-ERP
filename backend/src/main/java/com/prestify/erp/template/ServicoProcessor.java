package com.prestify.erp.template;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.dto.servico.ServicoVariacaoRequestDTO;
import com.prestify.erp.entity.Categoria;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.enums.TipoCategoria;
import com.prestify.erp.enums.TipoPrecoServico;
import com.prestify.erp.exception.ServicoRegraException;
import com.prestify.erp.factory.PrecoServicoFactory;
import com.prestify.erp.repository.CategoriaRepository;
import com.prestify.erp.repository.ServicoRepository;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/** Template Method: mantém a ordem comum das etapas de cadastro e atualização. */
@Component
public class ServicoProcessor {
    private final ServicoRepository servicoRepository;
    private final CategoriaRepository categoriaRepository;
    private final PrecoServicoFactory precoFactory;

    public ServicoProcessor(ServicoRepository servicoRepository, CategoriaRepository categoriaRepository, PrecoServicoFactory precoFactory) {
        this.servicoRepository = servicoRepository;
        this.categoriaRepository = categoriaRepository;
        this.precoFactory = precoFactory;
    }

    public final Servico processar(Servico servico, ServicoRequestDTO dados, Long organizacaoId, Long idAtual) {
        validarCamposBasicos(dados);
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
        precoFactory.configurarPreco(servico, dados);
        return servico;
    }

    private void validarCamposBasicos(ServicoRequestDTO dados) {
        if (dados.getTipoPreco() == null) throw new ServicoRegraException("Selecione o tipo de preço.");
        if (dados.getTipoPreco() == TipoPrecoServico.UNICO) {
            if (dados.getPreco() == null || dados.getPreco().signum() <= 0) throw new ServicoRegraException("Informe um preço maior que zero para o serviço.");
            if (dados.getVariacoes() != null && !dados.getVariacoes().isEmpty()) throw new ServicoRegraException("Preço único não deve conter variações.");
            return;
        }
        if (dados.getPreco() != null) throw new ServicoRegraException("Não informe um preço único quando o serviço usa variações.");
        if (dados.getVariacoes() == null || dados.getVariacoes().isEmpty()) throw new ServicoRegraException("Cadastre pelo menos uma variação de preço.");
        Set<String> nomes = new HashSet<>();
        for (ServicoVariacaoRequestDTO variacao : dados.getVariacoes()) {
            if (variacao.getNome() == null || variacao.getNome().isBlank()) throw new ServicoRegraException("Informe o nome de cada variação.");
            if (!nomes.add(variacao.getNome().trim().toLowerCase(Locale.ROOT))) throw new ServicoRegraException("Não repita o nome de uma variação no mesmo serviço.");
            if (variacao.getPreco() == null || variacao.getPreco().signum() <= 0) throw new ServicoRegraException("O preço de cada variação deve ser maior que zero.");
        }
    }

    private void validarCodigoOpcional(String codigo, Long organizacaoId, Long idAtual) {
        if (codigo == null || codigo.isBlank()) return;
        String normalizado = codigo.trim();
        boolean duplicado = idAtual == null
                ? servicoRepository.existsByCodigoIgnoreCaseAndOrganizacaoId(normalizado, organizacaoId)
                : servicoRepository.existsByCodigoIgnoreCaseAndOrganizacaoIdAndIdNot(normalizado, organizacaoId, idAtual);
        if (duplicado) throw new ServicoRegraException("Já existe um serviço com esse código nesta organização.");
    }
}
