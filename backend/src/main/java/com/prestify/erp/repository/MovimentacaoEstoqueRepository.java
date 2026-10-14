package com.prestify.erp.repository;

import com.prestify.erp.entity.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findAllByOrganizacaoIdOrderByDataCriacaoDesc(Long organizacaoId);
    List<MovimentacaoEstoque> findAllByOrganizacaoIdAndProdutoIdOrderByDataCriacaoDesc(Long organizacaoId, Long produtoId);
    boolean existsByOrganizacaoIdAndProdutoId(Long organizacaoId, Long produtoId);
}
