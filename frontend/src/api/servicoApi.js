import { http } from './http'
const CAMINHO = '/servicos'
export const listarServicos = () => http.get(CAMINHO)
export const buscarServico = (id) => http.get(`${CAMINHO}/${id}`)
export const criarServico = (dados) => http.post(CAMINHO, dados)
export const atualizarServico = (id, dados) => http.put(`${CAMINHO}/${id}`, dados)
export const excluirServico = (id) => http.delete(`${CAMINHO}/${id}`)
