
import { UserRound } from 'lucide-react'
import './Cabecalho.css'

function Cabecalho({ titulo = 'Início' }) {
  return (
    <header className="cabecalho">
      <div className="cabecalho__titulo">
        <h1>{titulo}</h1>
      </div>

      <div className="cabecalho__perfil">
        <div className="cabecalho__avatar">
          <UserRound size={20} strokeWidth={1.8} />
        </div>

        <div className="cabecalho__informacoes-usuario">
          <span className="cabecalho__nome-usuario">Usuário</span>
          <span className="cabecalho__cargo-usuario">Administrador</span>
        </div>
      </div>
    </header>
  )
}

export default Cabecalho