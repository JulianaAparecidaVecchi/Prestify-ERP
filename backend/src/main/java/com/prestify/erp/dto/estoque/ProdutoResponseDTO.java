
package com.prestify.erp.dto.estoque;

import com.prestify.erp.enums.StatusEstoque;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ProdutoResponseDTO {

    private Long id;
    private String nome;
    private String codigoSku;

    private BigDecimal precoCusto;
    private BigDecimal precoVenda;

    private String unidade;
    private LocalDate validade;

    private Integer quantidadeMinima;
    private Integer quantidadeAtual;
    private Integer quantidadeParaVenda;

    private Long categoriaId;
    private String categoriaNome;

    private boolean ativo;
    private StatusEstoque statusEstoque;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
