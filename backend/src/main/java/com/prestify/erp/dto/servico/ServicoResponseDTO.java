package com.prestify.erp.dto.servico;
import com.prestify.erp.enums.TipoPrecoServico; import java.math.BigDecimal; import java.util.List; import lombok.AllArgsConstructor; import lombok.Getter;
@Getter @AllArgsConstructor
public class ServicoResponseDTO { private Long id; private String codigo; private String nome; private String descricao; private Integer duracaoEstimada; private Long categoriaId; private String categoriaNome; private TipoPrecoServico tipoPreco; private BigDecimal preco; private List<ServicoVariacaoResponseDTO> variacoes; private boolean ativo; }
