package com.prestify.erp.dto.colaborador;

import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.dto.endereco.EnderecoDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.prestify.erp.enums.Genero;
import com.prestify.erp.enums.Funcao;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Formulário "Cadastro de Colaborador".
 * Campos de PF e PJ vêm no mesmo DTO; o ColaboradorService exige os que
 * pertencem ao tipoPessoa escolhido:
 *   PF -> nome (completo), cpf, dataNascimento, dataAdmissao, genero
 *   PJ -> nome (fantasia), razaoSocial, cnpj, dataAbertura
 */
public record ColaboradorRequestDTO(

        @NotNull(message = "O tipo de colaborador é obrigatório.")
        TipoPessoa tipoPessoa,

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
        String nome,

        @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres.")
        String razaoSocial,

        String cpf,

        String cnpj,

        @Past(message = "A data de nascimento deve estar no passado.")
        LocalDate dataNascimento,

        LocalDate dataAdmissao,

        @PastOrPresent(message = "A data de criação da empresa não pode ser futura.")
        LocalDate dataAbertura,

        Genero genero,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "E-mail inválido.")
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
        String email,

        @NotBlank(message = "O telefone é obrigatório.")
        String telefone,

        // Obrigatória no cadastro. Na edição, se vier vazia, a senha atual é mantida.
        @Size(min = 8, message = "A senha deve ter ao menos 8 caracteres.")
        String senha,

        @NotNull(message = "A função é obrigatória.")
        Funcao funcao,

        @NotNull(message = "O salário é obrigatório.")
        @PositiveOrZero(message = "O salário não pode ser negativo.")
        BigDecimal salario,

        @NotNull(message = "O endereço é obrigatório.")
        @Valid
        EnderecoDTO endereco
) {
}
