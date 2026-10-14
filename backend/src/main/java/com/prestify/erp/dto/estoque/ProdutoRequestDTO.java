
package com.prestify.erp.dto.estoque;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ProdutoRequestDTO {

    @NotBlank(message = "O nome do produto é obrigatório.")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
    private String nome;

    @Size(max = 80, message = "O SKU deve ter no máximo 80 caracteres.")
    private String codigoSku;

    @NotNull(message = "O preço de custo é obrigatório.")
    @DecimalMin(value = "0.0", message = "O preço de custo não pode ser negativo.")
    private BigDecimal precoCusto;

    @NotNull(message = "O preço de venda é obrigatório.")
    @DecimalMin(value = "0.0", message = "O preço de venda não pode ser negativo.")
    private BigDecimal precoVenda;

    @NotBlank(message = "A unidade é obrigatória.")
    @Size(max = 30, message = "A unidade deve ter no máximo 30 caracteres.")
    private String unidade;

    private LocalDate validade;

    @NotNull(message = "A quantidade mínima é obrigatória.")
    @Min(value = 0, message = "A quantidade mínima não pode ser negativa.")
    private Integer quantidadeMinima;

    @NotNull(message = "A quantidade atual é obrigatória.")
    @Min(value = 0, message = "A quantidade atual não pode ser negativa.")
    private Integer quantidadeAtual;

    @NotNull(message = "A quantidade para venda é obrigatória.")
    @PositiveOrZero(message = "A quantidade para venda não pode ser negativa.")
    private Integer quantidadeParaVenda;

    private Long categoriaId;

    private Boolean ativo = true;
}