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

import { criarCrudApi } from './criarCrudApi'

const api = criarCrudApi('/categorias')

export const listarCategorias = api.listar
export const buscarCategoria = api.buscar
export const criarCategoria = api.criar
export const atualizarCategoria = api.atualizar
export const excluirCategoria = api.excluir