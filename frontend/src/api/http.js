import { obterSessao, encerrarSessao } from '../services/sessao'

/*
    Comunicação com o backend.
    VITE_API_URL configura o endereço da API.
    Token e organização são obtidos da sessão do usuário.
*/
const URL_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

function comOrganizacao(caminho, organizacaoId) {
    const [rota, consulta = ''] = caminho.split('?')
    const parametros = new URLSearchParams(consulta)
    parametros.set('organizacaoId', String(organizacaoId))
    return `${rota}?${parametros.toString()}`
}

async function requisitar(caminho, opcoes = {}, formato = 'json', autenticada = true) {
    const sessao = autenticada ? obterSessao() : null

    if (autenticada && !sessao) {
        encerrarSessao()
        throw new Error('Sua sessão expirou. Faça login novamente.')
    }

    const headers = new Headers(opcoes.headers)
    headers.set('Content-Type', 'application/json')

    if (sessao) {
        headers.set('Authorization', `${sessao.tipoToken} ${sessao.token}`)
    }

    const rota = sessao
        ? comOrganizacao(caminho, sessao.organizacaoId)
        : caminho

    let resposta

    try {
        resposta = await fetch(`${URL_BASE}${rota}`, {
            ...opcoes,
            headers,
        })
    } catch {
        throw new Error(
            'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
        )
    }

    if (!resposta.ok) {
        let mensagem = `Erro ${resposta.status} ao se comunicar com o servidor.`

        try {
            const corpo = await resposta.json()
            mensagem = corpo.mensagem || corpo.message || corpo.erro || mensagem
        } catch {
            // Resposta sem JSON: mantém a mensagem padrão.
        }

        if (resposta.status === 401 && autenticada) {
            // Uma resposta antiga não deve encerrar um login mais recente.
            const sessaoAtual = obterSessao()

            if (!sessaoAtual || sessaoAtual.token === sessao.token) {
                encerrarSessao()
            }
        }

        const erro = new Error(mensagem)
        erro.status = resposta.status
        throw erro
    }

    if (resposta.status === 204) return null

    return formato === 'blob' ? resposta.blob() : resposta.json()
}

async function baixar(caminho, nomeArquivo) {
    const arquivo = await requisitar(caminho, {}, 'blob')

    if (!arquivo) {
        throw new Error('O servidor não retornou o arquivo para download.')
    }

    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo

    try {
        document.body.appendChild(link)
        link.click()
    } finally {
        link.remove()

        // Aguarda o início do download antes de liberar a URL.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
}

export const http = {
    login: (dados) =>
        requisitar('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dados),
        }, 'json', false),

    get: (caminho) => requisitar(caminho),

    post: (caminho, dados) =>
        requisitar(caminho, {
            method: 'POST',
            body: JSON.stringify(dados),
        }),

    put: (caminho, dados) =>
        requisitar(caminho, {
            method: 'PUT',
            body: JSON.stringify(dados),
        }),

    delete: (caminho) =>
        requisitar(caminho, {
            method: 'DELETE',
        }),

    patch: (caminho, dados) =>
        requisitar(caminho, {
            method: 'PATCH',
            ...(dados === undefined ? {} : { body: JSON.stringify(dados) }),
        }),

    baixar,
}