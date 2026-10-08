package com.prestify.erp.entity;

import com.prestify.erp.enums.TipoPessoa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "fornecedor")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public abstract class Fornecedor {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fornecedor")
    private Long id;
 
    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;
 
    @Column(name = "segmento_atuacao", length = 100)
    private String segmentoAtuacao;
 
    @Column(name = "email", length = 150)
    private String email;
 
    @Column(name = "telefone", length = 20)
    private String telefone;
 
    @Embedded
    private Endereco endereco = new Endereco();
 
    @Column(name = "ativo", nullable = false)
    private boolean ativo = true;
 
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
 
    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    public abstract TipoPessoa getTipoPessoa(); // PF ou PJ
 
    @PrePersist
    void aoCriar() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = dataCriacao;
    }
 
    @PreUpdate
    void aoAtualizar() {
        dataAtualizacao = LocalDateTime.now();
    }
}