import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { http } from '../api/http'
import {
    EVENTO_SESSAO,
    obterSessao,
    salvarSessao,
    encerrarSessao,
} from '../services/sessao'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [sessao, setSessao] = useState(obterSessao)

    useEffect(() => {
        function sincronizar() {
            setSessao(obterSessao())
        }

        function aoMostrarAba() {
            if (!document.hidden) sincronizar()
        }

        window.addEventListener(EVENTO_SESSAO, sincronizar)
        window.addEventListener('focus', sincronizar)
        document.addEventListener('visibilitychange', aoMostrarAba)
        sincronizar()

        return () => {
            window.removeEventListener(EVENTO_SESSAO, sincronizar)
            window.removeEventListener('focus', sincronizar)
            document.removeEventListener('visibilitychange', aoMostrarAba)
        }
    }, [])

    useEffect(() => {
        if (!sessao) return undefined

        const restante = Math.max(
            0,
            Date.parse(sessao.expiraEm) - Date.now()
        )

        const temporizador = window.setTimeout(() => {
            const atual = obterSessao()

            if (!atual) {
                encerrarSessao()
            } else {
                setSessao(atual)
            }
        }, Math.min(restante + 50, 2147483647))

        return () => window.clearTimeout(temporizador)
    }, [sessao])

    const entrar = useCallback(async (email, senha) => {
        const resposta = await http.login({
            email: email.trim(),
            senha,
        })

        const novaSessao = salvarSessao(resposta)
        setSessao(novaSessao)
        return novaSessao
    }, [])

    const sair = useCallback(() => {
        encerrarSessao()
        setSessao(null)
    }, [])

    const valor = useMemo(() => ({
        sessao,
        autenticado: Boolean(sessao),
        entrar,
        sair,
    }), [sessao, entrar, sair])

    return (
        <AuthContext.Provider value={valor}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const contexto = useContext(AuthContext)

    if (!contexto) {
        throw new Error(
            'useAuth deve ser utilizado dentro de AuthProvider.'
        )
    }

    return contexto
}