/*
  http.js — único ponto de conexão com o backend.

  O endereço da API vem da variável VITE_API_URL (arquivo .env).
  Se ela não existir, usa http://localhost:8080.
  Todas as chamadas do sistema passam por aqui, então se o endereço,
  o token de login ou o tratamento de erro mudarem, muda só este arquivo.
*/

const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function requisitar(caminho, opcoes = {}) {
  let resposta

  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
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

    // Se o backend explicar o erro no corpo da resposta, usa a explicação
    try {
      const corpo = await resposta.json()
      mensagem = corpo.mensagem || corpo.message || corpo.erro || mensagem
    } catch {
      // resposta sem corpo JSON: mantém a mensagem padrão
    }

    throw new Error(mensagem)
  }

  // 204 = sucesso sem conteúdo (comum em DELETE)
  if (resposta.status === 204) {
    return null
  }

  return resposta.json()
}

export const http = {
  get: (caminho) => requisitar(caminho),

  post: (caminho, dados) =>
    requisitar(caminho, { method: 'POST', body: JSON.stringify(dados) }),

  put: (caminho, dados) =>
    requisitar(caminho, { method: 'PUT', body: JSON.stringify(dados) }),

  delete: (caminho) => requisitar(caminho, { method: 'DELETE' }),
}
