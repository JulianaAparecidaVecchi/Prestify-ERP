package com.prestify.erp.repository;

import com.prestify.erp.entity.Cliente;
import com.prestify.erp.enums.TipoPessoa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    String CONSULTA_FILTRADA = """
        SELECT c FROM Cliente c
        WHERE c.organizacaoId = :organizacaoId
          AND (:tipoPessoa IS NULL OR c.tipoPessoa = :tipoPessoa)
          AND (:ativo IS NULL OR c.ativo = :ativo)
          AND (:estado IS NULL OR c.endereco.estado = :estado)
          AND (
              :busca IS NULL OR :busca = ''
              OR LOCATE(LOWER(:busca), LOWER(c.nome)) > 0
              OR LOCATE(LOWER(:busca), LOWER(c.email)) > 0
              OR (
                  :documento IS NOT NULL AND :documento <> ''
                  AND (
                      LOCATE(:documento, COALESCE(c.cpf, '')) > 0
                      OR LOCATE(:documento, COALESCE(c.cnpj, '')) > 0
                  )
              )
          )
        ORDER BY c.nome ASC, c.id ASC
        """;

    Optional<Cliente> findByIdAndOrganizacaoId(Long id, Long organizacaoId);

    boolean existsByCpfAndOrganizacaoId(String cpf, Long organizacaoId);

    boolean existsByCpfAndOrganizacaoIdAndIdNot(String cpf, Long organizacaoId, Long id);

    boolean existsByCnpjAndOrganizacaoId(String cnpj, Long organizacaoId);

    boolean existsByCnpjAndOrganizacaoIdAndIdNot(String cnpj, Long organizacaoId, Long id);

    @Query(CONSULTA_FILTRADA)
    Page<Cliente> buscarComFiltros(
            @Param("organizacaoId") Long organizacaoId,
            @Param("busca") String busca,
            @Param("documento") String documento,
            @Param("tipoPessoa") TipoPessoa tipoPessoa,
            @Param("ativo") Boolean ativo,
            @Param("estado") String estado,
            Pageable pageable);

    @Query(CONSULTA_FILTRADA)
    List<Cliente> buscarParaExportacao(
            @Param("organizacaoId") Long organizacaoId,
            @Param("busca") String busca,
            @Param("documento") String documento,
            @Param("tipoPessoa") TipoPessoa tipoPessoa,
            @Param("ativo") Boolean ativo,
            @Param("estado") String estado);
}