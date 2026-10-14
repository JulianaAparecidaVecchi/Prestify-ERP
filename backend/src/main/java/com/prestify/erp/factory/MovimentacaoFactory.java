package com.prestify.erp.factory;

import com.prestify.erp.entity.MovimentacaoEstoque;
import com.prestify.erp.entity.Produto;
import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import org.springframework.stereotype.Component;

/**
 * Factory: concentra a criação de uma movimentação com os campos de histórico.
 */
@Component
public class MovimentacaoFactory {
    public MovimentacaoEstoque criar(Produto produto, Long organizacaoId,
            TipoMovimentacaoEstoque tipo, int quantidadeMovimentada,
            int quantidadeAnterior, int quantidadeNova, String motivo) {
        MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
        movimentacao.setProduto(produto);
        movimentacao.setOrganizacaoId(organizacaoId);
        movimentacao.setTipo(tipo);
        movimentacao.setQuantidadeMovimentada(quantidadeMovimentada);
        movimentacao.setQuantidadeAnterior(quantidadeAnterior);
        movimentacao.setQuantidadeNova(quantidadeNova);
        movimentacao.setMotivo(motivo == null || motivo.isBlank() ? null : motivo.trim());
        return movimentacao;
    }
}
