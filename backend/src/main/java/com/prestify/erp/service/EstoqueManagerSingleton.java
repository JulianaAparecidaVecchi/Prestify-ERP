package com.prestify.erp.service;

import com.prestify.erp.enums.StatusEstoque;
import org.springframework.stereotype.Component;

/**
 * Regra compartilhada para classificar o nível do estoque.
 * O Spring gerencia este componente como singleton por padrão.
 */
@Component
public class EstoqueManagerSingleton {

    public StatusEstoque calcularStatus(int quantidadeAtual, int quantidadeMinima) {
        if (quantidadeAtual <= 0) {
            return StatusEstoque.ZERADO;
        }
        if (quantidadeAtual <= quantidadeMinima) {
            return StatusEstoque.BAIXO;
        }
        return StatusEstoque.NORMAL;
    }
}
