package com.prestify.erp.dto.cliente;

import com.prestify.erp.dto.endereco.EnderecoDTO;
import com.prestify.erp.enums.Genero;
import com.prestify.erp.enums.TipoPessoa;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ClienteRequestDTO {

    @NotNull(message = "Selecione o tipo de cliente.")
    private TipoPessoa tipoPessoa;

    @NotBlank(message = "Informe o nome completo ou a razão social.")
    @Size(max = 150, message = "O nome ou a razão social deve ter no máximo 150 caracteres.")
    private String nome;

    @Size(max = 14, message = "O CPF deve ter no máximo 14 caracteres, incluindo a pontuação.")
    private String cpf;

    @Size(max = 18, message = "O CNPJ deve ter no máximo 18 caracteres, incluindo a pontuação.")
    private String cnpj;

    @PastOrPresent(message = "A data de nascimento não pode estar no futuro.")
    private LocalDate dataNascimento;

    private Genero genero;

    @NotBlank(message = "Informe o e-mail do cliente.")
    @Email(message = "Informe um e-mail válido.")
    @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
    private String email;

    @NotBlank(message = "Informe o telefone do cliente.")
    @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres, incluindo a pontuação.")
    private String telefone;

    @NotNull(message = "Informe o endereço do cliente.")
    @Valid
    private EnderecoDTO endereco;
}