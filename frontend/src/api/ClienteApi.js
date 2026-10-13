import { http } from './http'

const CAMINHO = '/clientes'

function comFiltros(caminho, filtros = {}, paginacao = false) {
    const parametros = new URLSearchParams()

    for (const campo of ['busca', 'tipoPessoa', 'ativo', 'estado']) {
        const valor = filtros[campo]

        if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
            parametros.set(campo, String(valor).trim())
        }
    }

    if (paginacao) {
        parametros.set('pagina', String(filtros.pagina ?? 0))
        parametros.set('tamanho', String(filtros.tamanho ?? 5))
    }

    const consulta = parametros.toString()
    return consulta ? `${caminho}?${consulta}` : caminho
}

export const listarClientes = (filtros = {}) =>
    http.get(comFiltros(CAMINHO, filtros, true))

export const buscarCliente = (id) =>
    http.get(`${CAMINHO}/${id}`)

export const criarCliente = (dados) =>
    http.post(CAMINHO, dados)

export const atualizarCliente = (id, dados) =>
    http.put(`${CAMINHO}/${id}`, dados)

export const alterarStatusCliente = (id, ativo) =>
    http.patch(`${CAMINHO}/${id}/status`, { ativo })

export const inativarCliente = (id) =>
    alterarStatusCliente(id, false)

export const reativarCliente = (id) =>
    alterarStatusCliente(id, true)

export const exportarClientesCsv = (filtros = {}) =>
    http.baixar(comFiltros(`${CAMINHO}/exportar/csv`, filtros), 'clientes.csv')

export const exportarClientesPdf = (filtros = {}) =>
    http.baixar(comFiltros(`${CAMINHO}/exportar/pdf`, filtros), 'clientes.pdf')