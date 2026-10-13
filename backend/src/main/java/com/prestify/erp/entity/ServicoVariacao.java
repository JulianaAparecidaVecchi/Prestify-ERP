package com.prestify.erp.entity;
import jakarta.persistence.*; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; import java.math.BigDecimal;
@Entity @Table(name="servico_variacao", uniqueConstraints=@UniqueConstraint(name="uk_variacao_servico_nome", columnNames={"servico_id","nome"})) @Getter @Setter @NoArgsConstructor
public class ServicoVariacao {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="servico_id", nullable=false) private Servico servico;
 @Column(nullable=false, length=100) private String nome;
 @Column(length=500) private String descricao;
 @Column(nullable=false, precision=10, scale=2) private BigDecimal preco;
}
