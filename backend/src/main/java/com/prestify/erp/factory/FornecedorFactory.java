package com.prestify.erp.factory;

import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.enums.TipoPessoa;

// Factory Method
public abstract class FornecedorFactory {

    public abstract TipoPessoa getTipoPessoa();

    protected abstract Fornecedor criarFornecedor();

    public Fornecedor criar(Long organizacaoId) {
        Fornecedor fornecedor = criarFornecedor();
        fornecedor.setOrganizacaoId(organizacaoId);
        return fornecedor;
    }
}