package com.prestify.erp.dto.endereco;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnderecoDTO {
 
    @Size(max = 150, message = "O logradouro deve ter no máximo 150 caracteres.")
    private String logradouro;
 
    @Size(max = 20, message = "O número deve ter no máximo 20 caracteres.")
    private String numero;
 
    @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres.")
    private String complemento;
 
    @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres.")
    private String bairro;
 
    @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres.")
    private String cidade;
 
    @Size(max = 2, message = "O estado deve ter 2 caracteres (UF).")
    private String estado;
 
    @Size(max = 9, message = "O CEP deve ter no máximo 9 caracteres.")
    private String cep;
}