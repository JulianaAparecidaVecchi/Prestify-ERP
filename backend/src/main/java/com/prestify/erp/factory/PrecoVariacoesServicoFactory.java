package com.prestify.erp.factory;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.dto.servico.ServicoVariacaoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.entity.ServicoVariacao;
import com.prestify.erp.enums.TipoPrecoServico;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/** Fábrica concreta responsável somente por criar preços por variação. */
@Component
public class PrecoVariacoesServicoFactory extends ServicoPrecoFactory {
    @Override
    public TipoPrecoServico getTipoPreco() { return TipoPrecoServico.VARIACOES; }

    @Override
    public PrecoServicoCriado criarPreco(Servico servico, ServicoRequestDTO dados) {
        List<ServicoVariacao> resultado = new ArrayList<>();
        if (dados.getVariacoes() != null) {
            for (ServicoVariacaoRequestDTO dado : dados.getVariacoes()) {
                ServicoVariacao variacao = new ServicoVariacao();
                variacao.setServico(servico);
                variacao.setNome(dado.getNome().trim());
                variacao.setDescricao(dado.getDescricao() == null || dado.getDescricao().isBlank()
                        ? null : dado.getDescricao().trim());
                variacao.setPreco(dado.getPreco());
                resultado.add(variacao);
            }
        }
        return PrecoServicoCriado.variacoes(resultado);
    }
}
