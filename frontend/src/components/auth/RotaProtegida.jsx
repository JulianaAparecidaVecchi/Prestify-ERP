import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'

/** Exibe as rotas internas somente quando existe uma sessão no frontend. */
function RotaProtegida() {
    const { autenticado } = useAuth()
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

    return <Outlet />
}

export default RotaProtegida