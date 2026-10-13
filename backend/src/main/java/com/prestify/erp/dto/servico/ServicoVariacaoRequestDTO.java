package com.prestify.erp.dto.servico;
import jakarta.validation.constraints.*; import java.math.BigDecimal; import lombok.Getter; import lombok.Setter;
@Getter @Setter
public class ServicoVariacaoRequestDTO {
 @NotBlank(message="Informe o nome de cada variação.") @Size(max=100, message="O nome da variação deve ter até 100 caracteres.") private String nome;
 @Size(max=500, message="A descrição da variação deve ter até 500 caracteres.") private String descricao;
 @NotNull(message="Informe o preço da variação.") @DecimalMin(value="0.00", inclusive=false, message="O preço deve ser maior que zero.") @Digits(integer=8, fraction=2, message="O preço deve ter até 2 casas decimais.") private BigDecimal preco;
}
