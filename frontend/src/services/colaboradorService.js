import api from './api'

export const colaboradorService = {
  async cadastrar(dados, organizacaoId) {
    const { data } = await api.post('/colaboradores', dados, {
      params: { organizacaoId },
    })
    return data
  },

  // O backend devolve uma página ({ content: [...], page: {...} }).
  // Aqui já devolvemos só a lista, pois a página de colaboradores
  // faz busca e paginação no próprio frontend.
  async listar(organizacaoId) {
    const { data } = await api.get('/colaboradores', {
      params: { organizacaoId, pagina: 0, tamanho: 100 },
    })
    return Array.isArray(data) ? data : (data?.content ?? [])
  },

  async buscarPorId(id, organizacaoId) {
    const { data } = await api.get(`/colaboradores/${id}`, {
      params: { organizacaoId },
    })
    return data
  },

  async atualizar(id, dados, organizacaoId) {
    const { data } = await api.put(`/colaboradores/${id}`, dados, {
      params: { organizacaoId },
    })
    return data
  },

  async excluir(id, organizacaoId) {
    await api.delete(`/colaboradores/${id}`, { params: { organizacaoId } })
  },
}