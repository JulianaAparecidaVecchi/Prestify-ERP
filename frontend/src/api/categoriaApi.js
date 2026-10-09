/*
  categoriaApi.js — chamadas do backend relacionadas a categorias.

  Contrato esperado da API:
    GET    /categorias        -> [ { id, nome, tipo, descricao } ]
    GET    /categorias/:id    -> { id, nome, tipo, descricao }
    POST   /categorias        -> cria (corpo: { nome, tipo, descricao })
    PUT    /categorias/:id    -> atualiza (mesmo corpo)
    DELETE /categorias/:id    -> exclui

  "tipo" é "SERVICO" ou "PRODUTO".
*/

import { http } from './http'

const CAMINHO = '/categorias'

export function listarCategorias() {
  return http.get(CAMINHO)
}

export function buscarCategoria(id) {
  return http.get(`${CAMINHO}/${id}`)
}

export function criarCategoria(dados) {
  return http.post(CAMINHO, dados)
}

export function atualizarCategoria(id, dados) {
  return http.put(`${CAMINHO}/${id}`, dados)
}

export function excluirCategoria(id) {
  return http.delete(`${CAMINHO}/${id}`)
}
