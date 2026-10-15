package com.prestify.erp.factory;

import com.prestify.erp.entity.ServicoPrecoUnico;
import com.prestify.erp.entity.ServicoVariacao;
import com.prestify.erp.enums.TipoPrecoServico;

import java.util.List;

/** Resultado tipado produzido pelas fábricas concretas de preço. */
public final class PrecoServicoCriado {
    private final TipoPrecoServico tipo;
    private final ServicoPrecoUnico precoUnico;
    private final List<ServicoVariacao> variacoes;

    private PrecoServicoCriado(TipoPrecoServico tipo, ServicoPrecoUnico precoUnico,
                               List<ServicoVariacao> variacoes) {
        this.tipo = tipo;
        this.precoUnico = precoUnico;
        this.variacoes = variacoes;
    }

    public static PrecoServicoCriado unico(ServicoPrecoUnico preco) {
        return new PrecoServicoCriado(TipoPrecoServico.UNICO, preco, List.of());
    }

    public static PrecoServicoCriado variacoes(List<ServicoVariacao> variacoes) {
        return new PrecoServicoCriado(TipoPrecoServico.VARIACOES, null, List.copyOf(variacoes));
    }

    public TipoPrecoServico getTipo() { return tipo; }
    public ServicoPrecoUnico getPrecoUnico() { return precoUnico; }
    public List<ServicoVariacao> getVariacoes() { return variacoes; }
}
