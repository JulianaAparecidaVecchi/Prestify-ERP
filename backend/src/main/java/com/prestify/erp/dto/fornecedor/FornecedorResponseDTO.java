package com.prestify.erp.dto.fornecedor;
 
import com.prestify.erp.entity.Endereco;
import com.prestify.erp.enums.TipoPessoa;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class FornecedorResponseDTO {
 
    private Long id;
    private TipoPessoa tipoPessoa;
 
    // PF
    private String nome;
    private String cpf;
    private LocalDate dataNascimento;
 
    // PJ
    private String razaoSocial;
    private String cnpj;

    private String segmentoAtuacao;
    private String email;
    private String telefone;
    private Endereco endereco;
    private boolean ativo;
}