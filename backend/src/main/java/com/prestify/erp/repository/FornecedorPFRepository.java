package com.prestify.erp.repository; 
import com.prestify.erp.entity.FornecedorPF;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorPFRepository extends JpaRepository<FornecedorPF, Long> {
 
    boolean existsByCpfAndOrganizacaoId(String cpf, Long organizacaoId);
 
    boolean existsByCpfAndOrganizacaoIdAndIdNot(String cpf, Long organizacaoId, Long id);
}