/*
  categoriaApi.js — chamadas do backend relacionadas a categorias.

  Rotas do backend (CategoriaController). O prefixo /api vem do VITE_API_URL
  e o organizacaoId é acrescentado automaticamente pelo http.js.

    GET    /categorias        -> [ { id, nome, tipo } ]
    GET    /categorias/:id    -> { id, nome, tipo }
    POST   /categorias        -> cria (corpo: { nome, tipo })
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
