package com.prestify.erp.categoria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByOrganizacaoIdAndTipo(
        Long organizacaoId,
        TipoCategoria tipo
    );

    Optional<Categoria> findByIdAndOrganizacaoId(
        Long id,
        Long organizacaoId
    );

    boolean existsByNomeIgnoreCaseAndTipoAndOrganizacaoId(
        String nome,
        TipoCategoria tipo,
        Long organizacaoId
    );
}