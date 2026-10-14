import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import './Cabecalho.css'

const FUNCOES = {
    ADMINISTRADOR: 'Administrador',
    ANALISTA_RH: 'Analista de RH',
    ANALISTA_FINANCEIRO: 'Analista Financeiro',
    ESTOQUISTA: 'Estoquista',
    COMERCIAL: 'Comercial',
    GERENTE_SUPRIMENTOS: 'Gerente de Suprimentos',
    VENDEDOR: 'Vendedor',
    PRESTADOR_SERVICO: 'Prestador de Serviço',
}

function obterIniciais(nome) {
    const partes = nome.trim().split(/\s+/)

    if (partes.length === 1) {
        return partes[0].slice(0, 2).toUpperCase()
    }

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function obterCorAvatar(nome) {
    const soma = [...nome].reduce(
        (total, letra) => total + letra.charCodeAt(0),
        0
    )

    return (soma % 5) + 1
}

function Cabecalho() {
    const { sessao, sair } = useAuth()
    const navegar = useNavigate()
    const [menuAberto, setMenuAberto] = useState(false)
    const contaRef = useRef(null)
    const perfilRef = useRef(null)
    const menuId = useId()

    useEffect(() => {
        if (!menuAberto) return undefined

        function aoClicarFora(evento) {
            if (!contaRef.current?.contains(evento.target)) {
                setMenuAberto(false)
            }
        }

        function aoPressionarTecla(evento) {
            if (evento.key === 'Escape') {
                setMenuAberto(false)
                perfilRef.current?.focus()
            }
        }

        document.addEventListener('pointerdown', aoClicarFora)
        document.addEventListener('keydown', aoPressionarTecla)

        return () => {
            document.removeEventListener('pointerdown', aoClicarFora)
            document.removeEventListener('keydown', aoPressionarTecla)
        }
    }, [menuAberto])

    function encerrar() {
        sair()
        navegar('/login', { replace: true })
    }

    if (!sessao) return null

    const nome = sessao.nome.trim() || sessao.email
    const perfil = FUNCOES[sessao.funcao] || sessao.funcao

    return (
        <header className="cabecalho">
            <button
                type="button"
                className="cabecalho__notificacoes"
                aria-label="Notificações"
            >
                <Bell size={22} strokeWidth={1.8} />
            </button>

            <div className="cabecalho__conta" ref={contaRef}>
                <button
                    ref={perfilRef}
                    type="button"
                    className="cabecalho__perfil"
                    aria-label={`Opções da conta de ${nome}`}
                    aria-expanded={menuAberto}
                    aria-controls={menuId}
                    onClick={() => setMenuAberto((atual) => !atual)}
                >
                    <span
                        className={`cabecalho__avatar cabecalho__avatar--cor-${obterCorAvatar(nome)}`}
                    >
                        {obterIniciais(nome)}
                    </span>

                    <span className="cabecalho__informacoes-usuario">
                        <span className="cabecalho__nome-usuario">
                            {nome}
                        </span>

                        <span className="cabecalho__perfil-usuario">
                            {perfil}
                        </span>
                    </span>

                    <ChevronDown size={20} strokeWidth={2} />
                </button>

                {menuAberto && (
                    <div id={menuId} className="cabecalho__menu-conta">
                        <p className="cabecalho__email">
                            {sessao.email}
                        </p>

                        <p className="cabecalho__organizacao">
                            Organização {sessao.organizacaoId}
                        </p>

                        <button
                            type="button"
                            className="cabecalho__sair"
                            onClick={encerrar}
                        >
                            <LogOut size={18} />
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Cabecalho