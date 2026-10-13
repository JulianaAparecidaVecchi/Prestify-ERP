package com.prestify.erp.dto.servico;
import com.prestify.erp.enums.TipoPrecoServico; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.util.List;
@Getter @Setter
public class ServicoRequestDTO {
 @Size(max=30, message="O código deve ter até 30 caracteres.") private String codigo;
 @NotBlank(message="O nome do serviço é obrigatório.") @Size(max=150, message="O nome deve ter até 150 caracteres.") private String nome;
 @Size(max=1000, message="A descrição deve ter até 1000 caracteres.") private String descricao;
 @NotNull(message="A duração estimada é obrigatória.") @Min(value=1, message="A duração deve ser de pelo menos 1 minuto.") private Integer duracaoEstimada;
 @NotNull(message="Selecione uma categoria.") private Long categoriaId;
 @NotNull(message="Informe o modelo de preço.") private TipoPrecoServico tipoPreco = TipoPrecoServico.VARIACOES;
 @DecimalMin(value="0.00", inclusive=false, message="O preço deve ser maior que zero.") @Digits(integer=8, fraction=2, message="O preço deve ter até 2 casas decimais.") private BigDecimal preco;
 @Valid private List<ServicoVariacaoRequestDTO> variacoes;
}
