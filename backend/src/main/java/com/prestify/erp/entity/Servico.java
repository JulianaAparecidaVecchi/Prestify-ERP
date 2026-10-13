package com.prestify.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="servico", uniqueConstraints=@UniqueConstraint(name="uk_servico_org_codigo", columnNames={"organizacao_id","codigo"}))
@Getter @Setter @NoArgsConstructor
public class Servico {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="organizacao_id", nullable=false) private Long organizacaoId;
    @Column(nullable=true, length=30) private String codigo;
    @Column(nullable=false, length=150) private String nome;
    @Column(length=1000) private String descricao;
    @Column(name="duracao_estimada", nullable=false) private Integer duracaoEstimada;
    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="categoria_id", nullable=false) private Categoria categoria;
    @Enumerated(EnumType.STRING) @Column(name="tipo_preco", nullable=false, length=20) private com.prestify.erp.enums.TipoPrecoServico tipoPreco;
    @OneToOne(mappedBy="servico", cascade=CascadeType.ALL, orphanRemoval=true, fetch=FetchType.LAZY)
    private ServicoPrecoUnico precoUnico;
    @OneToMany(mappedBy="servico", cascade=CascadeType.ALL, orphanRemoval=true)
    @OrderBy("id ASC") private List<ServicoVariacao> variacoes = new ArrayList<>();
    @Column(nullable=false) private boolean ativo = true;

    public void substituirVariacoes(List<ServicoVariacao> novas) {
        variacoes.clear();
        if (novas != null) {
            for (ServicoVariacao variacao : novas) { variacao.setServico(this); variacoes.add(variacao); }
        }
    }
}
