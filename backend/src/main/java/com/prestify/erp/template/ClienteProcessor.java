package com.prestify.erp.template;

import com.prestify.erp.dto.cliente.ClienteRequestDTO;
import com.prestify.erp.dto.endereco.EnderecoDTO;
import com.prestify.erp.entity.Cliente;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.exception.ClienteExceptions.ClienteNaoEncontradoException;
import com.prestify.erp.exception.ClienteExceptions.DadosInvalidosException;

import java.util.Locale;
import java.util.Objects;
import java.util.Set;

/** Template Method: define o fluxo comum de cadastro e atualização. */
public abstract class ClienteProcessor {

    private static final Set<String> ESTADOS = Set.of(
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    );

    public final Cliente processar(
            Cliente cliente,
            ClienteRequestDTO dados,
            Long organizacaoId,
            Long idAtual) {

        validarContexto(cliente, dados, organizacaoId, idAtual);
        validarDadosComuns(dados);
        validarDadosEspecificos(dados);

        String documento = normalizarDocumento(dados);
        validarFormatoDocumento(documento);
        validarDuplicidade(documento, organizacaoId, idAtual);

        preencherDadosComuns(cliente, dados, organizacaoId);
        preencherDadosEspecificos(cliente, dados, documento);
        return cliente;
    }

    public abstract TipoPessoa getTipoPessoa();

    protected abstract void validarDadosEspecificos(ClienteRequestDTO dados);

    protected abstract String normalizarDocumento(ClienteRequestDTO dados);

    protected abstract void validarFormatoDocumento(String documento);

    protected abstract void validarDuplicidade(
            String documento, Long organizacaoId, Long idAtual);

    protected abstract void preencherDadosEspecificos(
            Cliente cliente, ClienteRequestDTO dados, String documento);

    private void validarContexto(
            Cliente cliente,
            ClienteRequestDTO dados,
            Long organizacaoId,
            Long idAtual) {

        if (cliente == null || dados == null) {
            throw new DadosInvalidosException("Informe os dados do cliente.");
        }
        if (organizacaoId == null || organizacaoId <= 0) {
            throw new DadosInvalidosException("Informe uma organização válida.");
        }
        if (!Objects.equals(cliente.getId(), idAtual)) {
            throw new DadosInvalidosException("O identificador não corresponde ao cliente informado.");
        }
        if (cliente.getId() != null
                && !Objects.equals(cliente.getOrganizacaoId(), organizacaoId)) {
            throw new ClienteNaoEncontradoException();
        }
        if (dados.getTipoPessoa() != getTipoPessoa()) {
            throw new DadosInvalidosException("O tipo de cliente não corresponde ao processamento selecionado.");
        }
    }

    private void validarDadosComuns(ClienteRequestDTO dados) {
        exigirTexto(dados.getNome(), "Informe o nome completo ou a razão social.");
        exigirTexto(dados.getEmail(), "Informe o e-mail do cliente.");
        exigirTexto(dados.getTelefone(), "Informe o telefone do cliente.");

        String telefone = dados.getTelefone().trim();
        String digitos = somenteDigitos(telefone);
        if (!telefone.matches("[0-9().\\s-]+") || !digitos.matches("[0-9]{10,11}")) {
            throw new DadosInvalidosException("Informe um telefone com DDD e 10 ou 11 dígitos.");
        }

        validarEndereco(dados.getEndereco());
    }

    private void validarEndereco(EnderecoDTO endereco) {
        if (endereco == null) {
            throw new DadosInvalidosException("Informe o endereço do cliente.");
        }

        exigirTexto(endereco.getCep(), "Informe o CEP.");
        exigirTexto(endereco.getLogradouro(), "Informe a rua.");
        exigirTexto(endereco.getNumero(), "Informe o número do endereço.");
        exigirTexto(endereco.getBairro(), "Informe o bairro.");
        exigirTexto(endereco.getCidade(), "Informe a cidade.");
        exigirTexto(endereco.getEstado(), "Informe o estado.");

        if (!endereco.getCep().trim().matches("[0-9]{5}-?[0-9]{3}")) {
            throw new DadosInvalidosException("Informe um CEP válido com 8 dígitos.");
        }
        if (!ESTADOS.contains(endereco.getEstado().trim().toUpperCase(Locale.ROOT))) {
            throw new DadosInvalidosException("Informe uma UF válida.");
        }
    }

    private void preencherDadosComuns(
            Cliente cliente, ClienteRequestDTO dados, Long organizacaoId) {

        cliente.setOrganizacaoId(organizacaoId);
        cliente.setTipoPessoa(getTipoPessoa());
        cliente.setNome(dados.getNome().trim());
        cliente.setEmail(dados.getEmail().trim().toLowerCase(Locale.ROOT));
        cliente.setTelefone(somenteDigitos(dados.getTelefone()));
        cliente.setEndereco(dados.getEndereco().toEntity());
    }

    protected final void exigirTexto(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new DadosInvalidosException(mensagem);
        }
    }

    protected final String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }
}