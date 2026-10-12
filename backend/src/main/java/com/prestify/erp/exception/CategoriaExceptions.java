package com.prestify.erp.exception;

/** Exceções de negócio do módulo de categorias (mesmo padrão do ColaboradorExceptions). */
public class CategoriaExceptions {

    public static class CategoriaNaoEncontradaException extends RuntimeException {
        public CategoriaNaoEncontradaException() {
            super("Categoria não encontrada.");
        }
    }

    public static class CategoriaDuplicadaException extends RuntimeException {
        public CategoriaDuplicadaException() {
            super("Já existe uma categoria com esse nome.");
        }
    }
}
