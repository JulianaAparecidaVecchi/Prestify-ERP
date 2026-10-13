package com.prestify.erp.dto.servico;
import java.math.BigDecimal; import lombok.AllArgsConstructor; import lombok.Getter;
@Getter @AllArgsConstructor
public class ServicoVariacaoResponseDTO { private Long id; private String nome; private String descricao; private BigDecimal preco; }
