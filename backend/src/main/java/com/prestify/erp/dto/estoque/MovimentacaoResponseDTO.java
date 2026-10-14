package com.prestify.erp.dto.estoque;

import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MovimentacaoResponseDTO {
    private Long id;
    private Long produtoId;
    private String produtoNome;
    private TipoMovimentacaoEstoque tipo;
    private Integer quantidadeMovimentada;
    private Integer quantidadeAnterior;
    private Integer quantidadeNova;
    private String motivo;
    private LocalDateTime dataCriacao;
}
