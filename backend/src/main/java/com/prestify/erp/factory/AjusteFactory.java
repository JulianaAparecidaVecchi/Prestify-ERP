package com.prestify.erp.factory;

import com.prestify.erp.entity.MovimentacaoEstoque;
import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import org.springframework.stereotype.Component;

@Component
public class AjusteFactory extends MovimentacaoFactory {

    @Override
    public TipoMovimentacaoEstoque getTipo() {
        return TipoMovimentacaoEstoque.AJUSTE;
    }

    @Override
    protected MovimentacaoEstoque criarMovimentacao() {
        MovimentacaoEstoque m = new MovimentacaoEstoque();
        m.setTipo(TipoMovimentacaoEstoque.AJUSTE);
        return m;
    }

    @Override
    public int calcularNovaQuantidade(int quantidadeAtual, int quantidade) {
        return quantidade;
    }

    @Override
    public int calcularQuantidadeHistorico(int quantidadeAtual, int quantidadeNova, int quantidade) {
        return Math.abs(quantidadeNova - quantidadeAtual);
    }
}