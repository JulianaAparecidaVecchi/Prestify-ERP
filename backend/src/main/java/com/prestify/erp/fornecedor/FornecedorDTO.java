package com.prestify.erp.fornecedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record FornecedorDTO(
        Long id,
        String codigo,
        @NotBlank(message = "Nome é obrigatório") String nome,
        @NotBlank(message = "CNPJ é obrigatório") String cnpj,
        @Email(message = "E-mail inválido") String email,
        String telefone,
        String endereco
) {
    public static FornecedorDTO fromEntity(Fornecedor f) {
        return new FornecedorDTO(f.getId(), f.getCodigo(), f.getNome(), f.getCnpj(), f.getEmail(), f.getTelefone(), f.getEndereco());
    }

    public Fornecedor toEntity() {
        Fornecedor f = new Fornecedor();
        f.setId(id);
        f.setNome(nome);
        f.setCnpj(cnpj);
        f.setEmail(email);
        f.setTelefone(telefone);
        f.setEndereco(endereco);
        return f;
    }
}