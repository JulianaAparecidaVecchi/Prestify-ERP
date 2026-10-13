package com.prestify.erp.template;

import com.prestify.erp.dto.cliente.ClienteRequestDTO;
import com.prestify.erp.entity.Cliente;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.exception.ClienteExceptions.DadosInvalidosException;
import com.prestify.erp.exception.ClienteExceptions.DocumentoJaCadastradoException;
import com.prestify.erp.repository.ClienteRepository;
import org.springframework.stereotype.Component;

import java.util.Locale;

/** Especializa as etapas do Template Method para clientes Pessoa Jurídica. */
@Component
public class ClientePJProcessor extends ClienteProcessor {

    private final ClienteRepository repository;

    public ClientePJProcessor(ClienteRepository repository) {
        this.repository = repository;
    }

    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.JURIDICA;
    }

    @Override
    protected void validarDadosEspecificos(ClienteRequestDTO dados) {
        exigirTexto(dados.getCnpj(), "Informe o CNPJ do cliente.");

        String cnpj = dados.getCnpj().trim().toUpperCase(Locale.ROOT);
        if (!cnpj.matches("[A-Z0-9]{12}[0-9]{2}|[A-Z0-9]{2}\\.[A-Z0-9]{3}\\.[A-Z0-9]{3}/[A-Z0-9]{4}-[0-9]{2}")) {
            throw new DadosInvalidosException("Informe um CNPJ com 14 caracteres, com ou sem máscara.");
        }
        if (dados.getCpf() != null && !dados.getCpf().isBlank()) {
            throw new DadosInvalidosException("Pessoa Jurídica não deve possuir CPF neste cadastro.");
        }
        if (dados.getDataNascimento() != null || dados.getGenero() != null) {
            throw new DadosInvalidosException("Pessoa Jurídica não deve possuir data de nascimento ou gênero.");
        }
    }

    @Override
    protected String normalizarDocumento(ClienteRequestDTO dados) {
        return dados.getCnpj().trim().toUpperCase(Locale.ROOT)
            .replace(".", "")
            .replace("/", "")
            .replace("-", "");
    }

    @Override
    protected void validarFormatoDocumento(String cnpj) {
        if (cnpj == null || !cnpj.matches("[A-Z0-9]{12}[0-9]{2}")
                || cnpj.chars().distinct().count() == 1) {
            throw new DadosInvalidosException("Informe um CNPJ válido.");
        }

        int primeiroDigito = calcularDigito(cnpj, 12);
        int segundoDigito = calcularDigito(cnpj, 13);

        if (primeiroDigito != cnpj.charAt(12) - '0'
                || segundoDigito != cnpj.charAt(13) - '0') {
            throw new DadosInvalidosException("Informe um CNPJ válido.");
        }
    }

    @Override
    protected void validarDuplicidade(
            String cnpj, Long organizacaoId, Long idAtual) {

        boolean duplicado = idAtual == null
            ? repository.existsByCnpjAndOrganizacaoId(cnpj, organizacaoId)
            : repository.existsByCnpjAndOrganizacaoIdAndIdNot(cnpj, organizacaoId, idAtual);

        if (duplicado) {
            throw new DocumentoJaCadastradoException("CNPJ");
        }
    }

    @Override
    protected void preencherDadosEspecificos(
            Cliente cliente, ClienteRequestDTO dados, String cnpj) {

        cliente.setCnpj(cnpj);
        cliente.setCpf(null);
        cliente.setDataNascimento(null);
        cliente.setGenero(null);
    }

    private int calcularDigito(String cnpj, int quantidadeCaracteres) {
        int soma = 0;
        int peso = 2;

        for (int i = quantidadeCaracteres - 1; i >= 0; i--) {
            int valor = cnpj.charAt(i) - '0';
            soma += valor * peso;
            peso = peso == 9 ? 2 : peso + 1;
        }

        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}