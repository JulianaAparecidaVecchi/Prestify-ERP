package com.prestify.erp.dto.estoque;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumoEstoqueResponseDTO {
    private long totalProdutos;
    private long estoqueNormal;
    private long estoqueBaixo;
    private long estoqueZerado;
}
