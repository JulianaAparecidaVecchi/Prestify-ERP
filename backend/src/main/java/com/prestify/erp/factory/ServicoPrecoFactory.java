package com.prestify.erp.factory;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.enums.TipoPrecoServico;

/**
 * Creator abstrato do Factory Method. Não limpa nem associa preços: sua
 * responsabilidade é definir o contrato para criar uma estrutura de preço.
 */
public abstract class ServicoPrecoFactory {
    public abstract TipoPrecoServico getTipoPreco();

    /** Factory Method: cada fábrica concreta decide qual estrutura criar. */
    public abstract PrecoServicoCriado criarPreco(Servico servico, ServicoRequestDTO dados);
}
