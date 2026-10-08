import { Bell, ChevronDown } from 'lucide-react'
import './Cabecalho.css'

// Usuário fixo por enquanto. Quando houver login, virá do contexto/API.
const usuarioPadrao = {
  nome: 'Marina',
  perfil: 'Administrador',
}

// "Marina Pereira" -> "MP" | "Marina" -> "MA"
function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/)

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase()
  }

  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// A mesma pessoa sempre recebe a mesma cor (1 a 5), calculada pelo nome
function obterCorAvatar(nome) {
  const soma = [...nome].reduce((total, letra) => total + letra.charCodeAt(0), 0)
  return (soma % 5) + 1
}

function Cabecalho({ usuario = usuarioPadrao }) {
  return (
    <header className="cabecalho">
      <button
        type="button"
        className="cabecalho__notificacoes"
        aria-label="Notificações"
      >
        <Bell size={22} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        className="cabecalho__perfil"
        aria-label="Abrir menu do usuário"
      >
        <span
          className={`cabecalho__avatar cabecalho__avatar--cor-${obterCorAvatar(
            usuario.nome
          )}`}
        >
          {obterIniciais(usuario.nome)}
        </span>

        <span className="cabecalho__informacoes-usuario">
          <span className="cabecalho__nome-usuario">{usuario.nome}</span>
          <span className="cabecalho__perfil-usuario">{usuario.perfil}</span>
        </span>

        <ChevronDown size={20} strokeWidth={2} />
      </button>
    </header>
  )
}

export default Cabecalho