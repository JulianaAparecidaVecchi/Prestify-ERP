const CHAVE_SESSAO = 'prestify.sessao'

export const EVENTO_SESSAO = 'prestify:sessao-alterada'

function sessaoValida(sessao) {
    return sessao !== null && typeof sessao === 'object'
        && typeof sessao.token === 'string' && sessao.token.trim() !== ''
        && sessao.tipoToken === 'Bearer'
        && typeof sessao.expiraEm === 'string'
        && Number.isFinite(Date.parse(sessao.expiraEm))
        && Date.parse(sessao.expiraEm) > Date.now()
        && Number.isSafeInteger(sessao.colaboradorId) && sessao.colaboradorId > 0
        && Number.isSafeInteger(sessao.organizacaoId) && sessao.organizacaoId > 0
        && typeof sessao.nome === 'string'
        && typeof sessao.email === 'string'
        && typeof sessao.funcao === 'string' && sessao.funcao !== ''
}

export function obterSessao() {
    try {
        const texto = sessionStorage.getItem(CHAVE_SESSAO)
        if (!texto) return null

        const sessao = JSON.parse(texto)

        if (!sessaoValida(sessao)) {
            sessionStorage.removeItem(CHAVE_SESSAO)
            return null
        }

        return sessao
    } catch {
        return null
    }
}

export function salvarSessao(respostaLogin) {
    if (!sessaoValida(respostaLogin)) {
        throw new Error(
            'O servidor retornou uma sessão inválida. Tente fazer login novamente.'
        )
    }

    // Guarda somente os campos esperados, sem senha ou outros dados do formulário.
    const sessao = {
        token: respostaLogin.token,
        tipoToken: respostaLogin.tipoToken,
        expiraEm: respostaLogin.expiraEm,
        colaboradorId: respostaLogin.colaboradorId,
        organizacaoId: respostaLogin.organizacaoId,
        nome: respostaLogin.nome,
        email: respostaLogin.email,
        funcao: respostaLogin.funcao,
    }

    try {
        sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    } catch {
        throw new Error('Não foi possível guardar a sessão neste navegador.')
    }

    window.dispatchEvent(new Event(EVENTO_SESSAO))
    return sessao
}

export function encerrarSessao() {
    try {
        sessionStorage.removeItem(CHAVE_SESSAO)
    } finally {
        window.dispatchEvent(new Event(EVENTO_SESSAO))
    }
}