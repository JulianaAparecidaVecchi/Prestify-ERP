package com.prestify.erp.factory;

import com.prestify.erp.entity.MovimentacaoEstoque;
import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import org.springframework.stereotype.Component;

@Component
public class SaidaFactory extends MovimentacaoFactory {

    @Override
    public TipoMovimentacaoEstoque getTipo() {
        return TipoMovimentacaoEstoque.SAIDA;
    }

    @Override
    protected MovimentacaoEstoque criarMovimentacao() {
        MovimentacaoEstoque m = new MovimentacaoEstoque();
        m.setTipo(TipoMovimentacaoEstoque.SAIDA);
        return m;
    }

    @Override
    public int calcularNovaQuantidade(int quantidadeAtual, int quantidade) {
        return quantidadeAtual - quantidade;
    }
}