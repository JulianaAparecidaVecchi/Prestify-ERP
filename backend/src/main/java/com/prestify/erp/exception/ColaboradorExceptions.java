package com.prestify.erp.exception;

public class ColaboradorExceptions {

    public static class EmailJaCadastradoException extends RuntimeException {
        public EmailJaCadastradoException(String email) {
            super("Já existe um colaborador cadastrado com o e-mail " + email + ".");
        }
    }

    public static class ColaboradorNaoEncontradoException extends RuntimeException {
        public ColaboradorNaoEncontradoException() {
            super("Colaborador não encontrado.");
        }
    }

    public static class DadosInvalidosException extends RuntimeException {
        public DadosInvalidosException(String mensagem) {
            super(mensagem);
        }
    }
}
