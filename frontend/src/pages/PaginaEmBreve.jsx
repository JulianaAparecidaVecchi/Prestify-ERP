import { ArrowLeft, Construction } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import TopoPagina from '../components/layout/TopoPagina'
import './PaginaEmBreve.css'

function PaginaEmBreve({ titulo = 'Funcionalidade' }) {
  const navegar = useNavigate()
  const localizacao = useLocation()

  function voltar() {
    // Evita voltar para uma página externa quando esta é a primeira rota aberta.
    if (localizacao.key !== 'default') {
      navegar(-1)
    } else {
      navegar('/servicos', { replace: true })
    }
  }

  return (
    <section className="pagina-em-breve">
      <TopoPagina
        titulo={titulo}
        subtitulo="Esta área faz parte do Prestify-ERP."
        mostrarVoltar={false}
      />

      <div className="pagina-em-breve__cartao">
        <div className="pagina-em-breve__icone" aria-hidden="true">
          <Construction size={34} strokeWidth={1.7} />
        </div>
        <h2>Funcionalidade em desenvolvimento</h2>
        <p>
          Estamos trabalhando nesta página para disponibilizá-la em breve.
          Enquanto isso, você pode voltar e continuar usando as funcionalidades disponíveis.
        </p>
        <button className="pagina-em-breve__voltar" type="button" onClick={voltar}>
          <ArrowLeft size={18} />
          Voltar
        </button>
      </div>
    </section>
  )
}

export default PaginaEmBreve
