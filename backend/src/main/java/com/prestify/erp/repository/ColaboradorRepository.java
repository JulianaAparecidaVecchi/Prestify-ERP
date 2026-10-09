package com.prestify.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prestify.erp.entity.Colaborador;

import java.util.List;
import java.util.Optional;

public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {

    boolean existsByEmail(String email);

    List<Colaborador> findAllByOrganizacaoId(Long organizacaoId);

    Optional<Colaborador> findByIdAndOrganizacaoId(Long id, Long organizacaoId);

    @Query("select count(p) > 0 from ColaboradorPF p " +
           "where p.organizacaoId = :organizacaoId and p.cpf = :cpf and p.id <> :ignorarId")
    boolean existeCpf(@Param("organizacaoId") Long organizacaoId,
                      @Param("cpf") String cpf,
                      @Param("ignorarId") Long ignorarId);

    @Query("select count(p) > 0 from ColaboradorPJ p " +
           "where p.organizacaoId = :organizacaoId and p.cnpj = :cnpj and p.id <> :ignorarId")
    boolean existeCnpj(@Param("organizacaoId") Long organizacaoId,
                       @Param("cnpj") String cnpj,
                       @Param("ignorarId") Long ignorarId);
}
