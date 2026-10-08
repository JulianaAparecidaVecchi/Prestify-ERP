package com.prestify.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prestify.erp.entity.Fornecedor;

import java.util.Optional;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    Optional<Fornecedor> findByCnpj(String cnpj);
}