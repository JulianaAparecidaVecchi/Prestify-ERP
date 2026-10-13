package com.prestify.erp.entity;
import jakarta.persistence.*; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; import java.math.BigDecimal;
@Entity @Table(name="servico_unico") @Getter @Setter @NoArgsConstructor
public class ServicoPrecoUnico {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="servico_id", nullable=false, unique=true) private Servico servico;
 @Column(nullable=false, precision=10, scale=2) private BigDecimal preco;
}
