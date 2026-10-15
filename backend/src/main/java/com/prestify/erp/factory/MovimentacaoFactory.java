package com.prestify.erp.factory;

import com.prestify.erp.entity.MovimentacaoEstoque;
import com.prestify.erp.entity.Produto;
import com.prestify.erp.enums.TipoMovimentacaoEstoque;

public abstract class MovimentacaoFactory {

    public abstract TipoMovimentacaoEstoque getTipo();

    protected abstract MovimentacaoEstoque criarMovimentacao();

    public abstract int calcularNovaQuantidade(int quantidadeAtual, int quantidade);

    public int calcularQuantidadeHistorico(int quantidadeAtual, int quantidadeNova, int quantidade) {
        return quantidade;
    }

    public MovimentacaoEstoque criar(Produto produto, Long organizacaoId,
            int quantidadeMovimentada, int quantidadeAnterior,
            int quantidadeNova, String motivo) {

        MovimentacaoEstoque movimentacao = criarMovimentacao();
        movimentacao.setProduto(produto);
        movimentacao.setOrganizacaoId(organizacaoId);
        movimentacao.setQuantidadeMovimentada(quantidadeMovimentada);
        movimentacao.setQuantidadeAnterior(quantidadeAnterior);
        movimentacao.setQuantidadeNova(quantidadeNova);
        movimentacao.setMotivo(motivo == null || motivo.isBlank() ? null : motivo.trim());
        return movimentacao;
    }
}