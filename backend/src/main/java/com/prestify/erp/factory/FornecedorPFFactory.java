package com.prestify.erp.factory;

import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.entity.FornecedorPF;
import com.prestify.erp.enums.TipoPessoa;
import org.springframework.stereotype.Component;

// Factory Method
@Component
public class FornecedorPFFactory extends FornecedorFactory {

    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.FISICA;
    }

    @Override
    protected Fornecedor criarFornecedor() {
        return new FornecedorPF();
    }
}