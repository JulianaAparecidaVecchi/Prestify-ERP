package com.prestify.erp.entity;
 
import com.prestify.erp.enums.TipoPessoa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
@Entity
@Table(name = "fornecedor_pj")
@PrimaryKeyJoinColumn(name = "id_fornecedor_pj")
@Getter
@Setter
@NoArgsConstructor
public class FornecedorPJ extends Fornecedor {
 
    @Column(name = "razao_social", nullable = false, length = 150)
    private String razaoSocial;
 
    @Column(name = "cnpj", nullable = false, length = 14)
    private String cnpj;
 
    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.JURIDICA;
    }
}