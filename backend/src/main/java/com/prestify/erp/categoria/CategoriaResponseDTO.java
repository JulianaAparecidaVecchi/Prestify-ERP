package com.prestify.erp.categoria;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoriaResponseDTO {

    private Long id;
    private String nome;
    private TipoCategoria tipo;
}