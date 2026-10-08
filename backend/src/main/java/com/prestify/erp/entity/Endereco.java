package com.prestify.erp.entity;
 
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class Endereco {
 
    @Size(max = 150)
    @Column(name = "logradouro", length = 150)
    private String logradouro;
 
    @Size(max = 20)
    @Column(name = "numero", length = 20)
    private String numero;
 
    @Size(max = 100)
    @Column(name = "complemento", length = 100)
    private String complemento;
 
    @Size(max = 100)
    @Column(name = "bairro", length = 100)
    private String bairro;
 
    @Size(max = 100)
    @Column(name = "cidade", length = 100)
    private String cidade;
 
    @Size(max = 2)
    @Column(name = "estado", length = 2)
    private String estado;
 
    @Size(max = 9)
    @Column(name = "cep", length = 9)
    private String cep;
}