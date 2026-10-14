import { http } from './http'

export const listarProdutosEstoque = () => http.get('/estoque/produtos')
export const buscarProdutoEstoque = (id) => http.get(`/estoque/produtos/${id}`)
export const cadastrarProdutoEstoque = (dados) => http.post('/estoque/produtos', dados)
export const atualizarProdutoEstoque = (id, dados) => http.put(`/estoque/produtos/${id}`, dados)
export const excluirProdutoEstoque = (id) => http.delete(`/estoque/produtos/${id}`)
export const obterResumoEstoque = () => http.get('/estoque/resumo')
export const listarMovimentacoesEstoque = (produtoId) => {
  const filtro = produtoId ? `?produtoId=${encodeURIComponent(produtoId)}` : ''
  return http.get(`/estoque/movimentacoes${filtro}`)
}
export const registrarMovimentacaoEstoque = (dados) => http.post('/estoque/movimentacoes', dados)
