import { http } from './http'

const CAMINHO = '/fornecedores'

export const listarFornecedores = () =>
  http.get(CAMINHO)

export const buscarFornecedor = (id) =>
  http.get(`${CAMINHO}/${id}`)

export const criarFornecedor = (dados) =>
  http.post(CAMINHO, dados)

export const atualizarFornecedor = (id, dados) =>
  http.put(`${CAMINHO}/${id}`, dados)

export const inativarFornecedor = (id) =>
  http.patch(`${CAMINHO}/${id}/inativar`)

export const reativarFornecedor = (id) =>
  http.patch(`${CAMINHO}/${id}/reativar`)

export const excluirFornecedor = (id) =>
  http.delete(`${CAMINHO}/${id}`)