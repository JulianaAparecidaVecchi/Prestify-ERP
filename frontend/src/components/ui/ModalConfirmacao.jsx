import { useEffect } from 'react'

import Botao from './Botao'
import './ModalConfirmacao.css'

/*
  Janela de confirmação (ex.: "Tem certeza que deseja excluir?").

  Props:
    aberto           mostra ou esconde o modal
    titulo           título da janela
    mensagem         texto explicativo
    textoConfirmar   texto do botão de confirmação (padrão: "Excluir")
    carregando       desabilita os botões enquanto a ação roda
    erro             mensagem de erro para exibir dentro do modal
    onConfirmar      função chamada ao confirmar
    onCancelar       função chamada ao cancelar (botão, Esc ou clique fora)
*/
function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Excluir',
  carregando = false,
  erro = '',
  onConfirmar,
  onCancelar,
}) {
  // Permite fechar o modal com a tecla Esc
  useEffect(() => {
    if (!aberto) return undefined

    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape' && !carregando) {
        onCancelar()
      }
    }

    window.addEventListener('keydown', aoPressionarTecla)
    return () => window.removeEventListener('keydown', aoPressionarTecla)
  }, [aberto, carregando, onCancelar])

  if (!aberto) return null

  return (
    <div
      className="modal-confirmacao__fundo"
      onClick={() => !carregando && onCancelar()}
    >
      <div
        className="modal-confirmacao"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacao-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id="modal-confirmacao-titulo" className="modal-confirmacao__titulo">
          {titulo}
        </h2>

        <p className="modal-confirmacao__mensagem">{mensagem}</p>

        {erro && (
          <p className="modal-confirmacao__erro" role="alert">
            {erro}
          </p>
        )}

        <div className="modal-confirmacao__acoes">
          <Botao variante="cinza" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </Botao>

          <Botao
            variante="perigo"
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? 'Aguarde...' : textoConfirmar}
          </Botao>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmacao
