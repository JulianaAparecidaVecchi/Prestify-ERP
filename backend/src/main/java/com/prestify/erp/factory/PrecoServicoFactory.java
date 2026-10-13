package com.prestify.erp.factory;
import com.prestify.erp.entity.Servico; import com.prestify.erp.entity.ServicoPrecoUnico; import com.prestify.erp.entity.ServicoVariacao; import com.prestify.erp.dto.servico.ServicoRequestDTO; import com.prestify.erp.dto.servico.ServicoVariacaoRequestDTO; import com.prestify.erp.enums.TipoPrecoServico; import org.springframework.stereotype.Component; import java.util.ArrayList; import java.util.List;
/** Factory Method: centraliza a criação das estruturas de preço de cada serviço. */
@Component
public class PrecoServicoFactory {
 public ServicoPrecoUnico criarPrecoUnico(Servico servico, java.math.BigDecimal preco) { ServicoPrecoUnico item = new ServicoPrecoUnico(); item.setServico(servico); item.setPreco(preco); return item; }
 public List<ServicoVariacao> criarVariacoes(Servico servico, List<ServicoVariacaoRequestDTO> dados) {
  List<ServicoVariacao> resultado = new ArrayList<>();
  if (dados != null) for (ServicoVariacaoRequestDTO dado : dados) { ServicoVariacao item = new ServicoVariacao(); item.setServico(servico); item.setNome(dado.getNome().trim()); item.setDescricao(dado.getDescricao()==null ? null : dado.getDescricao().trim()); item.setPreco(dado.getPreco()); resultado.add(item); }
  return resultado;
 }
 public void configurarPreco(Servico servico, ServicoRequestDTO dados) {
  servico.setTipoPreco(dados.getTipoPreco());
  servico.setPrecoUnico(null);
  servico.substituirVariacoes(List.of());
  if (dados.getTipoPreco() == TipoPrecoServico.UNICO) servico.setPrecoUnico(criarPrecoUnico(servico, dados.getPreco()));
  else servico.substituirVariacoes(criarVariacoes(servico, dados.getVariacoes()));
 }
}
