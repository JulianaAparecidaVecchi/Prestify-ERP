package com.prestify.erp.dto.colaborador;

import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.dto.endereco.EnderecoDTO;
import com.prestify.erp.entity.Colaborador;
import com.prestify.erp.entity.ColaboradorPF;
import com.prestify.erp.entity.ColaboradorPJ;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.prestify.erp.enums.Genero;
import com.prestify.erp.enums.Funcao;
import com.prestify.erp.enums.StatusColaborador;

/** Nunca devolve a senha. Campos que não se aplicam ao tipo vêm null. */
public record ColaboradorResponseDTO(
        Long id,
        TipoPessoa tipoPessoa,
        String nome,
        String razaoSocial,
        String documento,
        LocalDate dataNascimento,
        LocalDate dataAdmissao,
        LocalDate dataAbertura,
        Genero genero,
        String email,
        String telefone,
        Funcao funcao,
        BigDecimal salario,
        StatusColaborador status,
        EnderecoDTO endereco,
        LocalDateTime dataCriacao
) {
    public static ColaboradorResponseDTO fromEntity(Colaborador c) {
        String razaoSocial = null;
        LocalDate dataNascimento = null;
        LocalDate dataAdmissao = null;
        LocalDate dataAbertura = null;
        Genero genero = null;

        if (c instanceof ColaboradorPF pf) {
            dataNascimento = pf.getDataNascimento();
            dataAdmissao = pf.getDataAdmissao();
            genero = pf.getGenero();
        } else if (c instanceof ColaboradorPJ pj) {
            razaoSocial = pj.getRazaoSocial();
            dataAbertura = pj.getDataAbertura();
        }

        return new ColaboradorResponseDTO(
                c.getId(), c.getTipoPessoa(), c.getNomeExibicao(), razaoSocial, c.getDocumento(),
                dataNascimento, dataAdmissao, dataAbertura, genero,
                c.getEmail(), c.getTelefone(), c.getFuncao(), c.getSalario(), c.getStatus(),
                EnderecoDTO.fromEntity(c.getEndereco()), c.getDataCriacao());
    }
}
