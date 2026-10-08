package com.prestify.erp.dto.categoria;

import com.prestify.erp.enums.TipoCategoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoriaRequestDTO {

    @NotBlank(message = "O nome da categoria é obrigatório.")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
    private String nome;

    @NotNull(message = "O tipo da categoria é obrigatório.")
    private TipoCategoria tipo;
}