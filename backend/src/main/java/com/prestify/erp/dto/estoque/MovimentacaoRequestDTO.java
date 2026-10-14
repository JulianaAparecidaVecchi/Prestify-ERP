package com.prestify.erp.dto.estoque;

import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovimentacaoRequestDTO {
    @NotNull(message = "O produto é obrigatório.")
    private Long produtoId;

    @NotNull(message = "O tipo de movimentação é obrigatório.")
    private TipoMovimentacaoEstoque tipo;

    @NotNull(message = "A quantidade é obrigatória.")
    @Min(value = 0, message = "A quantidade não pode ser negativa.")
    private Integer quantidade;

    @Size(max = 500, message = "O motivo deve ter no máximo 500 caracteres.")
    private String motivo;
}
