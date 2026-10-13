package com.prestify.erp.dto.cliente;

import com.prestify.erp.dto.endereco.EnderecoDTO;
import com.prestify.erp.enums.Genero;
import com.prestify.erp.enums.TipoPessoa;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ClienteResponseDTO {

    private Long id;

    private TipoPessoa tipoPessoa;

    private String nome;

    private String cpf;

    private String cnpj;

    private LocalDate dataNascimento;

    private Genero genero;

    private String email;

    private String telefone;

    private EnderecoDTO endereco;

    private boolean ativo;

    private LocalDateTime dataCriacao;

    private LocalDateTime dataAtualizacao;
}