package com.prestify.erp.util;

/**
 * Padrão Singleton (enum): a JVM garante uma única instância,
 * com segurança entre threads e sem risco de criação por reflexão ou serialização.
 * Não guarda estado, então pode ser compartilhado por todo o sistema.
 */
public enum ValidadorDocumento {

    INSTANCIA;

    private static final int[] PESOS_CNPJ_1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] PESOS_CNPJ_2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    public boolean cpfValido(String cpf) {
        String d = somenteDigitos(cpf);
        if (d.length() != 11 || todosIguais(d)) return false;
        return digitoCpf(d, 9) == d.charAt(9) - '0'
            && digitoCpf(d, 10) == d.charAt(10) - '0';
    }

    public boolean cnpjValido(String cnpj) {
        String d = somenteDigitos(cnpj);
        if (d.length() != 14 || todosIguais(d)) return false;
        return digitoCnpj(d, PESOS_CNPJ_1) == d.charAt(12) - '0'
            && digitoCnpj(d, PESOS_CNPJ_2) == d.charAt(13) - '0';
    }

    private int digitoCpf(String d, int quantidade) {
        int soma = 0;
        for (int i = 0; i < quantidade; i++) {
            soma += (d.charAt(i) - '0') * (quantidade + 1 - i);
        }
        int resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }

    private int digitoCnpj(String d, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (d.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    private boolean todosIguais(String d) {
        return d.chars().distinct().count() == 1;
    }
}