package com.prestify.erp.factory;

import com.prestify.erp.entity.MovimentacaoEstoque;
import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import org.springframework.stereotype.Component;

@Component
public class EntradaFactory extends MovimentacaoFactory {

    @Override
    public TipoMovimentacaoEstoque getTipo() {
        return TipoMovimentacaoEstoque.ENTRADA;
    }

    @Override
    protected MovimentacaoEstoque criarMovimentacao() {
        MovimentacaoEstoque m = new MovimentacaoEstoque();
        m.setTipo(TipoMovimentacaoEstoque.ENTRADA);
        return m;
    }

    @Override
    public int calcularNovaQuantidade(int quantidadeAtual, int quantidade) {
        return quantidadeAtual + quantidade;
    }
}