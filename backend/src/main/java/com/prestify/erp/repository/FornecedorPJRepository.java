package com.prestify.erp.repository;

import com.prestify.erp.entity.FornecedorPJ;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorPJRepository extends JpaRepository<FornecedorPJ, Long> {
 
    boolean existsByCnpjAndOrganizacaoId(String cnpj, Long organizacaoId);
 
    boolean existsByCnpjAndOrganizacaoIdAndIdNot(String cnpj, Long organizacaoId, Long id);
}