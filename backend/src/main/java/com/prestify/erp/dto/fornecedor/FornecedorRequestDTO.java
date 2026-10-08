package com.prestify.erp.dto.fornecedor;
 
import com.prestify.erp.entity.Endereco;
import com.prestify.erp.enums.TipoPessoa;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class FornecedorRequestDTO {
 
    @NotNull(message = "O tipo de pessoa é obrigatório.")
    private TipoPessoa tipoPessoa;
 
    // PF
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
    private String nome;
    private String cpf;
    private LocalDate dataNascimento;
 
    // PJ
    @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres.")
    private String razaoSocial;
    private String cnpj;

    @Size(max = 100, message = "O segmento deve ter no máximo 100 caracteres.")
    private String segmentoAtuacao;
 
    @Email(message = "E-mail inválido.")
    @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
    private String email;
 
    @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres.")
    private String telefone;
 
    @Valid
    private Endereco endereco;
}