package com.prestify.erp.dto.categoria;

import com.prestify.erp.enums.TipoCategoria;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoriaResponseDTO {

    private Long id;
    private String nome;
    private TipoCategoria tipo;
}