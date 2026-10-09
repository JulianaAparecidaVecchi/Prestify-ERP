package com.prestify.erp.entity;

import com.prestify.erp.enums.Funcao;
import com.prestify.erp.enums.StatusColaborador;
import com.prestify.erp.enums.TipoPessoa;
import com.prestify.erp.entity.Endereco;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Colaborador (funcionário) do modelo lógico. É abstrata porque todo
 * colaborador é obrigatoriamente PF ou PJ.
 * Herança JOINED: tabela "colaborador" (dados comuns) + "colaborador_pf" / "colaborador_pj".
 */
@Entity
@Table(name = "colaborador")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public abstract class Colaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 11)
    private String telefone;

    // Hash BCrypt, nunca a senha em texto puro.
    @Column(nullable = false, length = 255)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Funcao funcao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusColaborador status;

    @Embedded
    private Endereco endereco;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void aoCriar() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = this.dataCriacao;
    }

    @PreUpdate
    protected void aoAtualizar() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    public abstract TipoPessoa getTipoPessoa();

    /** Nome completo (PF) ou nome fantasia (PJ). */
    public abstract String getNomeExibicao();

    /** CPF (PF) ou CNPJ (PJ), só dígitos. */
    public abstract String getDocumento();
}
