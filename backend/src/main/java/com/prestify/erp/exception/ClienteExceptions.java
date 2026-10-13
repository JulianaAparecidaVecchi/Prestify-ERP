package com.prestify.erp.exception;

public class ClienteExceptions {

    public static class ClienteNaoEncontradoException extends RuntimeException {
        public ClienteNaoEncontradoException() {
            super("Cliente não encontrado nesta organização.");
        }
    }

    public static class DocumentoJaCadastradoException extends RuntimeException {
        public DocumentoJaCadastradoException(String tipoDocumento) {
            super("Já existe um cliente com esse " + tipoDocumento + " nesta organização.");
        }
    }

    public static class DadosInvalidosException extends RuntimeException {
        public DadosInvalidosException(String mensagem) {
            super(mensagem);
        }
    }
}