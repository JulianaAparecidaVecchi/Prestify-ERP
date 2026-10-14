package com.prestify.erp.repository;

import com.prestify.erp.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findAllByOrganizacaoIdOrderByNomeAsc(Long organizacaoId);

    Optional<Produto> findByIdAndOrganizacaoId(Long id, Long organizacaoId);

    @Query(
        value = """
            SELECT *
            FROM produto
            WHERE id = :id
              AND organizacao_id = :organizacaoId
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<Produto> buscarParaAtualizacao(
            @Param("id") Long id,
            @Param("organizacaoId") Long organizacaoId);

    boolean existsByOrganizacaoIdAndCodigoSkuIgnoreCase(
            Long organizacaoId, String codigoSku);

    boolean existsByOrganizacaoIdAndCodigoSkuIgnoreCaseAndIdNot(
            Long organizacaoId, String codigoSku, Long id);
}