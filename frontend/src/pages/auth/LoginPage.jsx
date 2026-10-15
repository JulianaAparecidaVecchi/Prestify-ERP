import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

import logoPrestify from '../../assets/logo-prestify.png'
import Botao from '../../components/ui/Botao'
import CampoFormulario from '../../components/ui/CampoFormulario'
import { useAuth } from '../../contexts/AuthContext'
import {
    obterPaginaInicial,
    podeAcessarCaminho,
} from '../../services/permissoes'

function LoginPage() {
    const { autenticado, sessao, entrar } = useAuth()
    const localizacao = useLocation()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [entrando, setEntrando] = useState(false)
    const [erro, setErro] = useState('')
    const [erros, setErros] = useState({})

    const solicitado = localizacao.state?.destino

    const destino = typeof solicitado === 'string'
        && solicitado.startsWith('/')
        && !solicitado.startsWith('//')
        && !solicitado.includes('\\')
        && solicitado.split(/[?#]/)[0] !== '/login'
        && podeAcessarCaminho(sessao?.funcao, solicitado)
        ? solicitado
        : obterPaginaInicial(sessao?.funcao)

    async function enviar(evento) {
        evento.preventDefault()
        if (entrando) return

        setErro('')
        const falhas = {}

        if (!email.trim()) {
            falhas.email = 'Informe o e-mail.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            falhas.email = 'Informe um e-mail válido.'
        }

        if (!senha.trim()) falhas.senha = 'Informe a senha.'

        setErros(falhas)
        if (Object.keys(falhas).length) return

        setEntrando(true)

        try {
            await entrar(email, senha)
            setSenha('')
        } catch (falha) {
            setErro(
                falha.message || 'Não foi possível entrar. Tente novamente.'
            )
        } finally {
            setEntrando(false)
        }
    }

    if (autenticado && destino !== '/login') {
        return <Navigate to={destino} replace />
    }

    return (
        <main className="pagina-login">
            <section
                className="pagina-login__apresentacao"
                aria-label="Prestify ERP"
            >
                <img
                    className="pagina-login__logo"
                    src={logoPrestify}
                    alt="Prestify"
                />

                <h1>Seu negócio, organizado em um só lugar.</h1>

                <p>
                    Gerencie clientes, serviços e a rotina da sua empresa
                    com o Prestify ERP.
                </p>
            </section>

            <section
                className="pagina-login__painel"
                aria-labelledby="titulo-login"
            >
                <div className="pagina-login__cartao">
                    <h2 id="titulo-login">Bem-vindo ao Prestify</h2>

                    <p className="pagina-login__subtitulo">
                        Entre com sua conta para continuar.
                    </p>

                    <form
                        onSubmit={enviar}
                        noValidate
                        aria-busy={entrando}
                    >
                        <CampoFormulario
                            rotulo="E-mail"
                            name="email"
                            type="email"
                            autoComplete="username"
                            placeholder="Digite seu e-mail"
                            maxLength={150}
                            value={email}
                            obrigatorio
                            required
                            disabled={entrando}
                            erro={erros.email}
                            onChange={(evento) => {
                                setEmail(evento.target.value)
                                setErros((atual) => ({
                                    ...atual,
                                    email: '',
                                }))
                                setErro('')
                            }}
                        />

                        <div className="pagina-login__senha">
                            <CampoFormulario
                                rotulo="Senha"
                                name="senha"
                                type={mostrarSenha ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Digite sua senha"
                                value={senha}
                                obrigatorio
                                required
                                disabled={entrando}
                                erro={erros.senha}
                                onChange={(evento) => {
                                    setSenha(evento.target.value)
                                    setErros((atual) => ({
                                        ...atual,
                                        senha: '',
                                    }))
                                    setErro('')
                                }}
                            />

                            <button
                                type="button"
                                className="pagina-login__mostrar-senha"
                                aria-label={mostrarSenha
                                    ? 'Ocultar senha'
                                    : 'Mostrar senha'
                                }
                                aria-pressed={mostrarSenha}
                                disabled={entrando}
                                onClick={() =>
                                    setMostrarSenha((atual) => !atual)
                                }
                            >
                                {mostrarSenha
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />}

                                {mostrarSenha
                                    ? 'Ocultar senha'
                                    : 'Mostrar senha'}
                            </button>
                        </div>

                        {erro && (
                            <p className="pagina-login__erro" role="alert">
                                {erro}
                            </p>
                        )}

                        <Botao
                            type="submit"
                            icone={LogIn}
                            disabled={entrando}
                        >
                            {entrando ? 'Entrando...' : 'Entrar'}
                        </Botao>
                    </form>

                    <p className="pagina-login__orientacao">
                        Seu acesso é fornecido pela administração
                        da sua empresa.
                    </p>
                </div>

                <footer className="pagina-login__rodape">
                    © 2026 Prestify.
                </footer>
            </section>
        </main>
    )
}

export default LoginPage