import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import {
    obterPaginaInicial,
    podeAcessarCaminho,
} from '../../services/permissoes'
import Botao from '../ui/Botao'

/** Exibe as rotas internas permitidas para a função da conta autenticada. */
function RotaProtegida() {
    const { autenticado, sessao, sair } = useAuth()
    const localizacao = useLocation()

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    destino: localizacao.pathname
                        + localizacao.search
                        + localizacao.hash,
                }}
            />
        )
    }

    const paginaInicial = obterPaginaInicial(sessao.funcao)

    if (paginaInicial === '/login') {
        return (
            <section>
                <p role="alert">
                    Sua conta não possui um perfil de acesso reconhecido.
                </p>

                <Botao onClick={sair}>Sair</Botao>
            </section>
        )
    }

    if (!podeAcessarCaminho(sessao.funcao, localizacao.pathname)) {
        return <Navigate to={paginaInicial} replace />
    }

    return <Outlet />
}

export default RotaProtegida