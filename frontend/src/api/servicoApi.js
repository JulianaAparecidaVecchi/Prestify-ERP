import { criarCrudApi } from './criarCrudApi'

const api = criarCrudApi('/servicos')

export const listarServicos = api.listar
export const buscarServico = api.buscar
export const criarServico = api.criar
export const atualizarServico = api.atualizar
export const excluirServico = api.excluir