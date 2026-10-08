package com.prestify.erp.entity;
 
import com.prestify.erp.enums.TipoPessoa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
import java.time.LocalDate;
 
@Entity
@Table(name = "fornecedor_pf")
@PrimaryKeyJoinColumn(name = "id_fornecedor_pf")
@Getter
@Setter
@NoArgsConstructor
public class FornecedorPF extends Fornecedor {
 
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;
 
    @Column(name = "cpf", nullable = false, length = 11)
    private String cpf;
 
    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;
 
    @Override
    public TipoPessoa getTipoPessoa() {
        return TipoPessoa.FISICA;
    }
}