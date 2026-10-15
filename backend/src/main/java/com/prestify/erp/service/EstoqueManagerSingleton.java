package com.prestify.erp.service;

import com.prestify.erp.enums.StatusEstoque;

public final class EstoqueManagerSingleton {

    private static final EstoqueManagerSingleton INSTANCIA = new EstoqueManagerSingleton();

    private EstoqueManagerSingleton() {
    }

    public static EstoqueManagerSingleton getInstance() {
        return INSTANCIA;
    }

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