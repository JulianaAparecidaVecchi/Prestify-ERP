import api from './api'

export const colaboradorService = {
  async cadastrar(dados, organizacaoId) {
    const { data } = await api.post('/colaboradores', dados, {
      params: { organizacaoId },
    })
    return data
  },

  async listar(organizacaoId) {
    const { data } = await api.get('/colaboradores', {
      params: { organizacaoId },
    })
    return data
  },

  async excluir(id, organizacaoId) {
    await api.delete(`/colaboradores/${id}`, { params: { organizacaoId } })
  },
}
