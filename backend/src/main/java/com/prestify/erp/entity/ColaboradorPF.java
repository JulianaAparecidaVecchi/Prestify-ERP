package com.prestify.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import com.prestify.erp.enums.Genero;
import com.prestify.erp.enums.TipoPessoa;

@Entity
@Table(name = "colaborador_pf")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
public class ColaboradorPF extends Colaborador {

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 11)
    private String cpf;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "data_admissao", nullable = false)
    private LocalDate dataAdmissao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Genero genero;

    @Override public TipoPessoa getTipoPessoa() { return TipoPessoa.FISICA; }
    @Override public String getNomeExibicao() { return nome; }
    @Override public String getDocumento() { return cpf; }
}
