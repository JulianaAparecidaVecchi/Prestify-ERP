package com.prestify.erp.fornecedor;

import com.prestify.erp.common.exception.RegraDeNegocioException;
import com.prestify.erp.common.singleton.GeradorCodigoSingleton;
import com.prestify.erp.common.template.CadastroTemplateService;
import org.springframework.stereotype.Service;

/**
 * Template Method
 */
@Service
public class FornecedorCadastroService extends CadastroTemplateService<Fornecedor> {

    private final FornecedorRepository repository;

    public FornecedorCadastroService(FornecedorRepository repository) {
        this.repository = repository;
    }

    @Override
    protected void validar(Fornecedor entidade) {
        if (entidade.getNome() == null || entidade.getNome().isBlank()) {
            throw new RegraDeNegocioException("Nome do fornecedor é obrigatório.");
        }
        if (entidade.getCnpj() == null || entidade.getCnpj().replaceAll("\\D", "").length() != 14) {
            throw new RegraDeNegocioException("CNPJ inválido. Deve conter 14 dígitos.");
        }
        repository.findByCnpj(entidade.getCnpj()).ifPresent(f -> {
            throw new RegraDeNegocioException("Já existe um fornecedor cadastrado com este CNPJ.");
        });
    }

    @Override
    protected void aplicarRegrasDeNegocio(Fornecedor entidade) {
        entidade.setNome(entidade.getNome().trim());
        entidade.setCnpj(entidade.getCnpj().replaceAll("\\D", ""));
    }

    @Override
    protected void gerarCodigo(Fornecedor entidade) {
        entidade.setCodigo(GeradorCodigoSingleton.getInstance().gerarCodigo("FOR"));
    }

    @Override
    protected Fornecedor persistir(Fornecedor entidade) {
        return repository.save(entidade);
    }
}