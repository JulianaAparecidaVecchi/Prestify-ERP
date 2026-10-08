package com.prestify.erp.entity;

import com.prestify.erp.enums.TipoCategoria;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(
    name = "categoria",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_categoria_organizacao_tipo_nome",
            columnNames = {"organizacao_id", "tipo", "nome"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 50)
    private TipoCategoria tipo;

    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;
}