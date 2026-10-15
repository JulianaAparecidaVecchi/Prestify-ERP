package com.prestify.erp.template;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.enums.TipoPrecoServico;
import com.prestify.erp.exception.ServicoRegraException;
import com.prestify.erp.factory.PrecoServicoFactory;
import com.prestify.erp.repository.CategoriaRepository;
import com.prestify.erp.repository.ServicoRepository;
import org.springframework.stereotype.Component;

/** Especializa as etapas do Template Method para serviços com preço único. */
@Component
public class ServicoPrecoUnicoProcessor extends ServicoProcessor {
    private final PrecoServicoFactory precoFactory;

    public ServicoPrecoUnicoProcessor(ServicoRepository servicoRepository, CategoriaRepository categoriaRepository, PrecoServicoFactory precoFactory) {
        super(servicoRepository, categoriaRepository);
        this.precoFactory = precoFactory;
    }

    @Override
    public TipoPrecoServico getTipoPreco() {
        return TipoPrecoServico.UNICO;
    }

    @Override
    protected void validarPreco(ServicoRequestDTO dados) {
        if (dados.getPreco() == null || dados.getPreco().signum() <= 0) throw new ServicoRegraException("Informe um preço maior que zero para o serviço.");
        if (dados.getVariacoes() != null && !dados.getVariacoes().isEmpty()) throw new ServicoRegraException("Preço único não deve conter variações.");
    }

    @Override
    protected void aplicarPreco(Servico servico, ServicoRequestDTO dados) {
        precoFactory.limparPrecoAnterior(servico);
        servico.setTipoPreco(TipoPrecoServico.UNICO);
        servico.setPrecoUnico(precoFactory.criarPrecoUnico(servico, dados.getPreco()));
    }
}
