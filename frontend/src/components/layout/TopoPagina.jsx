import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import './TopoPagina.css'

/*
  Topo padrão de cada tela (igual ao design):
    ← Voltar
    Título                                  [ botão de ação ]
    Subtítulo

  Props:
    titulo         texto grande (obrigatório)
    subtitulo      texto pequeno abaixo do título
    acao           elemento à direita, ex.: <button>Novo Serviço</button>
    mostrarVoltar  mostra o link "Voltar" (padrão: true)
*/
function TopoPagina({ titulo, subtitulo, acao, mostrarVoltar = true }) {
  const navegar = useNavigate()

  return (
    <div className="topo-pagina">
      {mostrarVoltar && (
        <button
          type="button"
          className="topo-pagina__voltar"
          onClick={() => navegar(-1)}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Voltar
        </button>
      )}

      <div className="topo-pagina__linha">
        <div className="topo-pagina__textos">
          <h1 className="topo-pagina__titulo">{titulo}</h1>
          {subtitulo && (
            <p className="topo-pagina__subtitulo">{subtitulo}</p>
          )}
        </div>

        {acao && <div className="topo-pagina__acao">{acao}</div>}
      </div>
    </div>
  )
}

export default TopoPagina
