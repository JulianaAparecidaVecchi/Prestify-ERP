package com.prestify.erp.template;

import com.prestify.erp.dto.cliente.ClienteRequestDTO;
import com.prestify.erp.entity.Cliente;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.exception.ClienteExceptions.DadosInvalidosException;
import com.prestify.erp.exception.ClienteExceptions.DocumentoJaCadastradoException;
import com.prestify.erp.repository.ClienteRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/** Especializa as etapas do Template Method para clientes Pessoa Física. */
@Component
public class ClientePFProcessor extends ClienteProcessor {

    private final ClienteRepository repository;

    public ClientePFProcessor(ClienteRepository repository) {
        this.repository = repository;
    }

    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.FISICA;
    }

    @Override
    protected void validarDadosEspecificos(ClienteRequestDTO dados) {
        exigirTexto(dados.getCpf(), "Informe o CPF do cliente.");

        String cpf = dados.getCpf().trim();
        if (!cpf.matches("[0-9]{11}|[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}")) {
            throw new DadosInvalidosException("Informe um CPF com 11 dígitos, com ou sem máscara.");
        }
        if (dados.getCnpj() != null && !dados.getCnpj().isBlank()) {
            throw new DadosInvalidosException("Pessoa Física não deve possuir CNPJ neste cadastro.");
        }
        if (dados.getDataNascimento() == null) {
            throw new DadosInvalidosException("Informe a data de nascimento do cliente.");
        }
        if (dados.getDataNascimento().isAfter(LocalDate.now())) {
            throw new DadosInvalidosException("A data de nascimento não pode estar no futuro.");
        }
        if (dados.getGenero() == null) {
            throw new DadosInvalidosException("Informe o gênero do cliente.");
        }
    }

    @Override
    protected String normalizarDocumento(ClienteRequestDTO dados) {
        return somenteDigitos(dados.getCpf());
    }

    @Override
    protected void validarFormatoDocumento(String cpf) {
        if (cpf == null || !cpf.matches("[0-9]{11}")
                || cpf.chars().distinct().count() == 1) {
            throw new DadosInvalidosException("Informe um CPF válido.");
        }

        int primeiroDigito = calcularDigito(cpf, 9);
        int segundoDigito = calcularDigito(cpf, 10);

        if (primeiroDigito != cpf.charAt(9) - '0'
                || segundoDigito != cpf.charAt(10) - '0') {
            throw new DadosInvalidosException("Informe um CPF válido.");
        }
    }

    @Override
    protected void validarDuplicidade(
            String cpf, Long organizacaoId, Long idAtual) {

        boolean duplicado = idAtual == null
            ? repository.existsByCpfAndOrganizacaoId(cpf, organizacaoId)
            : repository.existsByCpfAndOrganizacaoIdAndIdNot(cpf, organizacaoId, idAtual);

        if (duplicado) {
            throw new DocumentoJaCadastradoException("CPF");
        }
    }

    @Override
    protected void preencherDadosEspecificos(
            Cliente cliente, ClienteRequestDTO dados, String cpf) {

        cliente.setCpf(cpf);
        cliente.setCnpj(null);
        cliente.setDataNascimento(dados.getDataNascimento());
        cliente.setGenero(dados.getGenero());
    }

    private int calcularDigito(String cpf, int quantidadeDigitos) {
        int soma = 0;
        for (int i = 0; i < quantidadeDigitos; i++) {
            int digito = cpf.charAt(i) - '0';
            int peso = quantidadeDigitos + 1 - i;
            soma += digito * peso;
        }

        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}