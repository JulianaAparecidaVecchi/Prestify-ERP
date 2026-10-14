import axios, { AxiosHeaders } from 'axios'
import { obterSessao, encerrarSessao } from './sessao'

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, ''),
})

api.interceptors.request.use((config) => {
    const sessao = obterSessao()

    if (!sessao) {
        encerrarSessao()
        throw new Error('Sua sessão expirou. Faça login novamente.')
    }

    config.headers = AxiosHeaders.from(config.headers)
    config.headers.set('Authorization', `${sessao.tipoToken} ${sessao.token}`)

    // Substitui a organização fixa informada pelas telas pela organização da sessão.
    config.params = {
        ...config.params,
        organizacaoId: sessao.organizacaoId,
    }

    config.prestifyToken = sessao.token
    return config
})

api.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
        if (erro.response?.status === 401) {
            const sessaoAtual = obterSessao()

            // Uma resposta antiga não deve encerrar um login mais recente.
            if (!sessaoAtual || sessaoAtual.token === erro.config?.prestifyToken) {
                encerrarSessao()
            }
        }

        return Promise.reject(erro)
    }
)

export function extrairMensagemErro(erro) {
    return (
        erro.response?.data?.mensagem ??
        erro.response?.data?.message ??
        erro.response?.data?.erro ??
        (erro.response ? null : erro.message) ??
        'Não foi possível concluir a operação. Tente novamente.'
    )
}

export default api