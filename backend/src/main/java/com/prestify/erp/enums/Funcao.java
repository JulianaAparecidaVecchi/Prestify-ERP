package com.prestify.erp.enums;

/** Função do colaborador na empresa (atores do diagrama de casos de uso + RH do Figma). */
public enum Funcao {
    ADMINISTRADOR("Administrador"),
    ANALISTA_RH("Analista de RH"),
    ANALISTA_FINANCEIRO("Analista Financeiro"),
    ESTOQUISTA("Estoquista"),
    COMERCIAL("Comercial"),
    GERENTE_SUPRIMENTOS("Gerente de Suprimentos"),
    VENDEDOR("Vendedor"),
    PRESTADOR_SERVICO("Prestador de Serviço");

    private final String descricao;

    Funcao(String descricao) { this.descricao = descricao; }

    public String getDescricao() { return descricao; }
}
