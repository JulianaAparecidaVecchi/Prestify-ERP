package com.prestify.erp.template;

import com.prestify.erp.dto.fornecedor.FornecedorRequestDTO;
import com.prestify.erp.dto.fornecedor.FornecedorResponseDTO;
import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.entity.FornecedorPF;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.repository.FornecedorPFRepository;
import org.springframework.stereotype.Component;

// Template Method
@Component
public class FornecedorPFProcessor extends FornecedorProcessor {

    private final FornecedorPFRepository repository;

    public FornecedorPFProcessor(FornecedorPFRepository repository) {
        this.repository = repository;
    }

    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.FISICA;
    }

    @Override
    protected void validarCamposObrigatorios(FornecedorRequestDTO dados) {
        exigirTexto(dados.getNome(), "O nome é obrigatório.");
        exigirTexto(dados.getCpf(), "O CPF é obrigatório.");
    }

    @Override
    protected String normalizarDocumento(FornecedorRequestDTO dados) {
        return somenteDigitos(dados.getCpf());
    }

    @Override
    protected void validarFormatoDocumento(String cpf) {
        if (cpf.length() != 11) {
            throw new IllegalArgumentException("CPF inválido. Deve conter 11 dígitos.");
        }
    }

    @Override
    protected void validarDuplicidade(String cpf, Long organizacaoId, Long idAtual) {
        boolean duplicado = (idAtual == null)
            ? repository.existsByCpfAndOrganizacaoId(cpf, organizacaoId)
            : repository.existsByCpfAndOrganizacaoIdAndIdNot(cpf, organizacaoId, idAtual);

        if (duplicado) {
            throw new IllegalArgumentException("Já existe um fornecedor com esse CPF.");
        }
    }

    @Override
    protected void preencherDadosEspecificos(
            Fornecedor fornecedor, FornecedorRequestDTO dados, String cpf) {

        FornecedorPF pf = (FornecedorPF) fornecedor;
        pf.setNome(dados.getNome().trim());
        pf.setCpf(cpf);
        pf.setDataNascimento(dados.getDataNascimento());
    }

    @Override
    public FornecedorResponseDTO converterParaResponse(Fornecedor fornecedor) {
        FornecedorPF pf = (FornecedorPF) fornecedor;
        return montarResponse(pf, pf.getNome(), pf.getCpf(), pf.getDataNascimento(), null, null);
    }
}