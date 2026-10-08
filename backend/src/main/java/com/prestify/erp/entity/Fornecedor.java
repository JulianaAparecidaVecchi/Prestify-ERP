package com.prestify.erp.entity;
 
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(
    name = "fornecedor",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_fornecedor_organizacao_documento",
            columnNames = {"organizacao_id", "documento"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Fornecedor {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", nullable = false, length = 20)
    private TipoPessoa tipoPessoa;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "documento", nullable = false, length = 14)
    private String documento;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;
 
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