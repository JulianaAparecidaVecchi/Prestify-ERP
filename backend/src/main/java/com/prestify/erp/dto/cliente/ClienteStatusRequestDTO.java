package com.prestify.erp.dto.cliente;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteStatusRequestDTO {

    @NotNull(message = "Informe se o cliente deve ficar ativo ou inativo.")
    private Boolean ativo;
}