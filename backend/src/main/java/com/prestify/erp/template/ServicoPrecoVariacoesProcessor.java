package com.prestify.erp.template;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.dto.servico.ServicoVariacaoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.enums.TipoPrecoServico;
import com.prestify.erp.exception.ServicoRegraException;
import com.prestify.erp.factory.PrecoServicoFactory;
import com.prestify.erp.repository.CategoriaRepository;
import com.prestify.erp.repository.ServicoRepository;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/** Especializa as etapas do Template Method para serviços com variações de preço. */
@Component
public class ServicoPrecoVariacoesProcessor extends ServicoProcessor {
    private final PrecoServicoFactory precoFactory;

    public ServicoPrecoVariacoesProcessor(ServicoRepository servicoRepository, CategoriaRepository categoriaRepository, PrecoServicoFactory precoFactory) {
        super(servicoRepository, categoriaRepository);
        this.precoFactory = precoFactory;
    }

    @Override
    public TipoPrecoServico getTipoPreco() {
        return TipoPrecoServico.VARIACOES;
    }

    @Override
    protected void validarPreco(ServicoRequestDTO dados) {
        if (dados.getPreco() != null) throw new ServicoRegraException("Não informe um preço único quando o serviço usa variações.");
        if (dados.getVariacoes() == null || dados.getVariacoes().isEmpty()) throw new ServicoRegraException("Cadastre pelo menos uma variação de preço.");
        Set<String> nomes = new HashSet<>();
        for (ServicoVariacaoRequestDTO variacao : dados.getVariacoes()) {
            if (variacao.getNome() == null || variacao.getNome().isBlank()) throw new ServicoRegraException("Informe o nome de cada variação.");
            if (!nomes.add(variacao.getNome().trim().toLowerCase(Locale.ROOT))) throw new ServicoRegraException("Não repita o nome de uma variação no mesmo serviço.");
            if (variacao.getPreco() == null || variacao.getPreco().signum() <= 0) throw new ServicoRegraException("O preço de cada variação deve ser maior que zero.");
        }
    }

    @Override
    protected void aplicarPreco(Servico servico, ServicoRequestDTO dados) {
        precoFactory.limparPrecoAnterior(servico);
        servico.setTipoPreco(TipoPrecoServico.VARIACOES);
        servico.substituirVariacoes(precoFactory.criarVariacoes(servico, dados.getVariacoes()));
    }
}
