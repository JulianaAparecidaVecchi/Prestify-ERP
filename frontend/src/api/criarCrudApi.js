import { http } from './http'

export function criarCrudApi(caminho) {
  return {
    listar: () => http.get(caminho),

    buscar: (id) => http.get(`${caminho}/${id}`),

    criar: (dados) => http.post(caminho, dados),

    atualizar: (id, dados) =>
      http.put(`${caminho}/${id}`, dados),

    excluir: (id) => http.delete(`${caminho}/${id}`),
  }
}