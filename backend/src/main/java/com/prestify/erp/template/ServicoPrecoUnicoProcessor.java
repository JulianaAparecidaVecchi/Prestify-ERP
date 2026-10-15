package com.prestify.erp.template;

import com.prestify.erp.dto.servico.ServicoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.enums.TipoPrecoServico;
import com.prestify.erp.exception.ServicoRegraException;
import com.prestify.erp.factory.PrecoUnicoServicoFactory;
import com.prestify.erp.repository.CategoriaRepository;
import com.prestify.erp.repository.ServicoRepository;
import com.prestify.erp.service.PrecoServicoLimpezaService;
import org.springframework.stereotype.Component;

/** Implementação concreta do Template Method para serviço com preço único. */
@Component
public class ServicoPrecoUnicoProcessor extends ServicoProcessor {
    private final PrecoUnicoServicoFactory precoFactory;
    private final PrecoServicoLimpezaService limpezaService;

    public ServicoPrecoUnicoProcessor(ServicoRepository servicoRepository,
                                     CategoriaRepository categoriaRepository,
                                     PrecoUnicoServicoFactory precoFactory,
                                     PrecoServicoLimpezaService limpezaService) {
        super(servicoRepository, categoriaRepository);
        this.precoFactory = precoFactory;
        this.limpezaService = limpezaService;
    }

    @Override
    public TipoPrecoServico getTipoPreco() { return TipoPrecoServico.UNICO; }

    @Override
    protected void validarPreco(ServicoRequestDTO dados) {
        if (dados.getPreco() == null || dados.getPreco().signum() <= 0)
            throw new ServicoRegraException("Informe um preço maior que zero para o serviço.");
        if (dados.getVariacoes() != null && !dados.getVariacoes().isEmpty())
            throw new ServicoRegraException("Preço único não deve conter variações.");
    }

    @Override
    protected void aplicarPreco(Servico servico, ServicoRequestDTO dados) {
        limpezaService.limparPrecoAnterior(servico);
        servico.setTipoPreco(TipoPrecoServico.UNICO);
        servico.setPrecoUnico(precoFactory.criarPreco(servico, dados).getPrecoUnico());
    }
}
