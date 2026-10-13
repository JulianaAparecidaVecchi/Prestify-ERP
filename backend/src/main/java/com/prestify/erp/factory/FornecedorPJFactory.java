package com.prestify.erp.factory;

import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.entity.FornecedorPJ;
import com.prestify.erp.enums.TipoPessoa;
import org.springframework.stereotype.Component;

// Factory Method
@Component
public class FornecedorPJFactory extends FornecedorFactory {

    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.JURIDICA;
    }

    @Override
    protected Fornecedor criarFornecedor() {
        return new FornecedorPJ();
    }
}