package com.prestify.erp.repository;

import com.prestify.erp.entity.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
 
    List<Fornecedor> findAllByOrganizacaoId(Long organizacaoId);
 
    Optional<Fornecedor> findByIdAndOrganizacaoId(Long id, Long organizacaoId);
}