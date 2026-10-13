package com.prestify.erp.repository;
import com.prestify.erp.entity.Servico; import java.util.List; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface ServicoRepository extends JpaRepository<Servico, Long> {
 List<Servico> findAllByOrganizacaoIdOrderByNomeAsc(Long organizacaoId);
 Optional<Servico> findByIdAndOrganizacaoId(Long id, Long organizacaoId);
 boolean existsByCodigoIgnoreCaseAndOrganizacaoId(String codigo, Long organizacaoId);
 boolean existsByCodigoIgnoreCaseAndOrganizacaoIdAndIdNot(String codigo, Long organizacaoId, Long id);
}
