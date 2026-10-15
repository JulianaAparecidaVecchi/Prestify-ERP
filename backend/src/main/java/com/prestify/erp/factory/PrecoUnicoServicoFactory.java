package com.prestify.erp.factory;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.entity.ServicoPrecoUnico;
import com.prestify.erp.enums.TipoPrecoServico;
import org.springframework.stereotype.Component;

/** Fábrica concreta responsável somente por criar preço único. */
@Component
public class PrecoUnicoServicoFactory extends ServicoPrecoFactory {
    @Override
    public TipoPrecoServico getTipoPreco() { return TipoPrecoServico.UNICO; }

    @Override
    public PrecoServicoCriado criarPreco(Servico servico, ServicoRequestDTO dados) {
        ServicoPrecoUnico preco = new ServicoPrecoUnico();
        preco.setServico(servico);
        preco.setPreco(dados.getPreco());
        return PrecoServicoCriado.unico(preco);
    }
}
