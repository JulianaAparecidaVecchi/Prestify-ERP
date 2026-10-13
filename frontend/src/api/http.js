/*
    http.js: único ponto de conexão com o backend.

    Configuração (arquivo .env):
        VITE_API_URL          endereço da API   (padrão: http://localhost:8080/api)
        VITE_ORGANIZACAO_ID   id da organização (padrão: 1)

    O backend exige o parâmetro "organizacaoId" em todas as rotas.
    Enquanto não existe login, ele vem do .env.
*/

const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const ORGANIZACAO_ID = import.meta.env.VITE_ORGANIZACAO_ID || '1'

// Acrescenta organizacaoId ao caminho da requisição
function comOrganizacao(caminho) {
    const separador = caminho.includes('?') ? '&' : '?'
    return `${caminho}${separador}organizacaoId=${ORGANIZACAO_ID}`
}

async function requisitar(caminho, opcoes = {}, formato = 'json') {
    let resposta

    try {
        resposta = await fetch(`${URL_BASE}${comOrganizacao(caminho)}`, {
            headers: { 'Content-Type': 'application/json' },
            ...opcoes,
        })
    } catch {
        throw new Error(
            'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
        )
    }

    if (!resposta.ok) {
        let mensagem = `Erro ${resposta.status} ao se comunicar com o servidor.`

        // Usa a mensagem enviada pelo backend, quando disponível
        try {
            const corpo = await resposta.json()
            mensagem = corpo.mensagem || corpo.message || corpo.erro || mensagem
        } catch {
            // Resposta sem corpo JSON: mantém a mensagem padrão
        }

        throw new Error(mensagem)
    }

    // 204 indica sucesso sem conteúdo
    if (resposta.status === 204) {
        return null
    }

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

        // Aguarda o início do download antes de liberar a URL
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
}

export const http = {
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