package com.prestify.erp.template;

import com.prestify.erp.dto.fornecedor.FornecedorRequestDTO;
import com.prestify.erp.dto.fornecedor.FornecedorResponseDTO;
import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.entity.FornecedorPJ;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.repository.FornecedorPJRepository;
import org.springframework.stereotype.Component;

// Template Method
@Component
public class FornecedorPJProcessor extends FornecedorProcessor {

    private final FornecedorPJRepository repository;

    public FornecedorPJProcessor(FornecedorPJRepository repository) {
        this.repository = repository;
    }

    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.JURIDICA;
    }

    @Override
    protected void validarCamposObrigatorios(FornecedorRequestDTO dados) {
        exigirTexto(dados.getRazaoSocial(), "A razão social é obrigatória.");
        exigirTexto(dados.getCnpj(), "O CNPJ é obrigatório.");
    }

    @Override
    protected String normalizarDocumento(FornecedorRequestDTO dados) {
        return somenteDigitos(dados.getCnpj());
    }

    @Override
    protected void validarFormatoDocumento(String cnpj) {
        if (cnpj.length() != 14) {
            throw new IllegalArgumentException("CNPJ inválido. Deve conter 14 dígitos.");
        }
    }

    @Override
    protected void validarDuplicidade(String cnpj, Long organizacaoId, Long idAtual) {
        boolean duplicado = (idAtual == null)
            ? repository.existsByCnpjAndOrganizacaoId(cnpj, organizacaoId)
            : repository.existsByCnpjAndOrganizacaoIdAndIdNot(cnpj, organizacaoId, idAtual);

        if (duplicado) {
            throw new IllegalArgumentException("Já existe um fornecedor com esse CNPJ.");
        }
    }

    @Override
    protected void preencherDadosEspecificos(
            Fornecedor fornecedor, FornecedorRequestDTO dados, String cnpj) {

        FornecedorPJ pj = (FornecedorPJ) fornecedor;
        pj.setRazaoSocial(dados.getRazaoSocial().trim());
        pj.setCnpj(cnpj);
    }

    @Override
    public FornecedorResponseDTO converterParaResponse(Fornecedor fornecedor) {
        FornecedorPJ pj = (FornecedorPJ) fornecedor;
        return montarResponse(pj, null, null, null, pj.getRazaoSocial(), pj.getCnpj());
    }
}