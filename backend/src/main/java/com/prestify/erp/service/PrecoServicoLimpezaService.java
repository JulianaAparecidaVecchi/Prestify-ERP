package com.prestify.erp.service;

import com.prestify.erp.entity.Servico;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

import java.util.List;

/** Responsável por remover as estruturas de preço anteriores antes da substituição. */
@Service
public class PrecoServicoLimpezaService {
    private final EntityManager entityManager;

    public PrecoServicoLimpezaService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public void limparPrecoAnterior(Servico servico) {
        servico.setPrecoUnico(null);
        servico.substituirVariacoes(List.of());
        // Sincroniza as exclusões (orphanRemoval) antes de inserir os novos preços.
        entityManager.flush();
    }
}
