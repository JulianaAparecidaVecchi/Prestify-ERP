import { http } from './http'
import { criarCrudApi } from './criarCrudApi'

const CAMINHO = '/fornecedores'
const api = criarCrudApi(CAMINHO)

export const listarFornecedores = api.listar
export const buscarFornecedor = api.buscar
export const criarFornecedor = api.criar
export const atualizarFornecedor = api.atualizar
export const excluirFornecedor = api.excluir

export const inativarFornecedor = (id) =>
  http.patch(`${CAMINHO}/${id}/inativar`)

export const reativarFornecedor = (id) =>
  http.patch(`${CAMINHO}/${id}/reativar`)