package com.prestify.erp.factory;

import com.prestify.erp.dto.servico.ServicoVariacaoRequestDTO;
import com.prestify.erp.entity.Servico;
import com.prestify.erp.entity.ServicoPrecoUnico;
import com.prestify.erp.entity.ServicoVariacao;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe auxiliar dos processadores de serviço:
 * centraliza a criação e a limpeza das estruturas de preço.
 */
@Component
public class PrecoServicoFactory {

    private final EntityManager entityManager;

    public PrecoServicoFactory(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public ServicoPrecoUnico criarPrecoUnico(
            Servico servico,
            BigDecimal preco
    ) {
        ServicoPrecoUnico item = new ServicoPrecoUnico();
        item.setServico(servico);
        item.setPreco(preco);
        return item;
    }

    public List<ServicoVariacao> criarVariacoes(
            Servico servico,
            List<ServicoVariacaoRequestDTO> dados
    ) {
        List<ServicoVariacao> resultado = new ArrayList<>();

        if (dados != null) {
            for (ServicoVariacaoRequestDTO dado : dados) {
                ServicoVariacao item = new ServicoVariacao();

                item.setServico(servico);
                item.setNome(dado.getNome().trim());
                item.setDescricao(
                        dado.getDescricao() == null
                                || dado.getDescricao().isBlank()
                                ? null
                                : dado.getDescricao().trim()
                );
                item.setPreco(dado.getPreco());

                resultado.add(item);
            }
        }

        return resultado;
    }

    public void limparPrecoAnterior(Servico servico) {
        /*
         * Primeiro, removemos as estruturas de preço antigas.
         * O orphanRemoval das entidades remove os registros
         * antigos quando o Hibernate sincroniza as alterações.
         */
        servico.setPrecoUnico(null);
        servico.substituirVariacoes(List.of());

        /*
         * Força o Hibernate a sincronizar as exclusões antes
         * de criar os novos registros de preço.
         *
         * Isso evita conflitos com restrições únicas, como
         * servico_id e (servico_id, nome).
         */
        entityManager.flush();
    }
}