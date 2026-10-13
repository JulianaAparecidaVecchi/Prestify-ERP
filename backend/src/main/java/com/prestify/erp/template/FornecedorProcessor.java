package com.prestify.erp.template;

import com.prestify.erp.dto.fornecedor.FornecedorRequestDTO;
import com.prestify.erp.dto.fornecedor.FornecedorResponseDTO;
import com.prestify.erp.entity.Endereco;
import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.enums.TipoPessoa;
import java.time.LocalDate;

// Template Method
public abstract class FornecedorProcessor {

    public final Fornecedor processar(
            Fornecedor fornecedor,
            FornecedorRequestDTO dados,
            Long organizacaoId,
            Long idAtual) {

        validarCamposObrigatorios(dados);

        String documento = normalizarDocumento(dados);
        validarFormatoDocumento(documento);
        validarDuplicidade(documento, organizacaoId, idAtual);

        preencherDadosEspecificos(fornecedor, dados, documento);
        preencherDadosComuns(fornecedor, dados);

        return fornecedor;
    }

    public abstract TipoPessoa getTipoPessoa();

    protected abstract void validarCamposObrigatorios(FornecedorRequestDTO dados);

    protected abstract String normalizarDocumento(FornecedorRequestDTO dados);

    protected abstract void validarFormatoDocumento(String documento);

    protected abstract void validarDuplicidade(String documento, Long organizacaoId, Long idAtual);

    protected abstract void preencherDadosEspecificos(Fornecedor fornecedor, FornecedorRequestDTO dados, String documento);

    public abstract FornecedorResponseDTO converterParaResponse(Fornecedor fornecedor);

    protected void preencherDadosComuns(Fornecedor fornecedor, FornecedorRequestDTO dados) {
        fornecedor.setSegmentoAtuacao(dados.getSegmentoAtuacao());
        fornecedor.setEmail(dados.getEmail());
        fornecedor.setTelefone(dados.getTelefone());
        fornecedor.setEndereco(
            dados.getEndereco() != null ? dados.getEndereco() : new Endereco()
        );
    }

    protected void exigirTexto(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagem);
        }
    }

    protected String somenteDigitos(String valor) {
        return valor.replaceAll("\\D", "");
    }

    protected FornecedorResponseDTO montarResponse(
            Fornecedor f,
            String nome, String cpf, LocalDate dataNascimento,
            String razaoSocial, String cnpj) {

        return new FornecedorResponseDTO(
            f.getId(),
            f.getTipoPessoa(),
            nome,
            cpf,
            dataNascimento,
            razaoSocial,
            cnpj,
            f.getSegmentoAtuacao(),
            f.getEmail(),
            f.getTelefone(),
            f.getEndereco(),
            f.isAtivo()
        );
    }
}