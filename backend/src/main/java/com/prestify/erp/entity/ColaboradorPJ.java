package com.prestify.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import com.prestify.erp.enums.TipoPessoa;

@Entity
@Table(name = "colaborador_pj")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
public class ColaboradorPJ extends Colaborador {

    @Column(name = "nome_fantasia", nullable = false, length = 150)
    private String nomeFantasia;

    @Column(name = "razao_social", nullable = false, length = 150)
    private String razaoSocial;

    @Column(nullable = false, length = 14)
    private String cnpj;

    // "Data de criação" da empresa no Figma. Não usei esse nome porque
    // data_criacao já é o carimbo de quando o registro foi criado.
    @Column(name = "data_abertura", nullable = false)
    private LocalDate dataAbertura;

    @Override public TipoPessoa getTipoPessoa() { return TipoPessoa.JURIDICA; }
    @Override public String getNomeExibicao() { return nomeFantasia; }
    @Override public String getDocumento() { return cnpj; }
}
