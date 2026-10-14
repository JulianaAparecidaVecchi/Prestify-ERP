
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  History,
  RefreshCw,
  Search,
} from 'lucide-react'

import TopoPagina from '../../components/layout/TopoPagina'
import Botao from '../../components/ui/Botao'

import {
  listarMovimentacoesEstoque,
  listarProdutosEstoque,
  registrarMovimentacaoEstoque,
} from '../../api/estoqueApi'

import './MovimentacoesEstoquePage.css'

const dataHora = (valor) =>
  valor ? new Date(valor).toLocaleString('pt-BR') : '—'

const tipoLabel = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  AJUSTE: 'Ajuste',
}

function MovimentacoesEstoquePage() {
  const navegar = useNavigate()

  const [produtos, setProdutos] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [produtoId, setProdutoId] = useState('')
  const [tipo, setTipo] = useState('ENTRADA')
  const [quantidade, setQuantidade] = useState('1')
  const [motivo, setMotivo] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const [listaProdutos, listaMovimentacoes] = await Promise.all([
        listarProdutosEstoque(),
        listarMovimentacoesEstoque(),
      ])

      setProdutos(
        Array.isArray(listaProdutos)
          ? listaProdutos.filter((produto) => produto.ativo !== false)
          : []
      )

      setMovimentacoes(
        Array.isArray(listaMovimentacoes) ? listaMovimentacoes : []
      )
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar as movimentações.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const produtoSelecionado = produtos.find(
    (produto) => String(produto.id) === String(produtoId)
  )

  const historicoFiltrado = useMemo(
    () =>
      movimentacoes.filter((movimentacao) => {
        const texto = `${movimentacao.produtoNome || ''} ${
          movimentacao.tipo || ''
        } ${movimentacao.motivo || ''}`.toLowerCase()

        return (
          texto.includes(busca.trim().toLowerCase()) &&
          (filtroTipo === 'TODOS' || movimentacao.tipo === filtroTipo)
        )
      }),
    [movimentacoes, busca, filtroTipo]
  )

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setSucesso('')

    const qtd = Number(quantidade)

    if (!produtoId) {
      setErro('Selecione o produto.')
      return
    }

    if (
      !Number.isInteger(qtd) ||
      qtd < 0 ||
      (tipo !== 'AJUSTE' && qtd <= 0)
    ) {
      setErro(
        tipo === 'AJUSTE'
          ? 'Informe uma quantidade inteira igual ou maior que zero.'
          : 'Informe uma quantidade inteira maior que zero.'
      )
      return
    }

    if (
      tipo === 'SAIDA' &&
      produtoSelecionado &&
      qtd > Number(produtoSelecionado.quantidadeAtual)
    ) {
      setErro(
        `A saída não pode ser maior que o estoque atual (${produtoSelecionado.quantidadeAtual} ${
          produtoSelecionado.unidade || 'unidades'
        }).`
      )
      return
    }

    setSalvando(true)

    try {
      await registrarMovimentacaoEstoque({
        produtoId: Number(produtoId),
        tipo,
        quantidade: qtd,
        motivo: motivo.trim() || null,
      })

      setSucesso('Movimentação registrada com sucesso.')
      setQuantidade('1')
      setMotivo('')

      await carregar()
    } catch (e) {
      setErro(e.message || 'Não foi possível registrar a movimentação.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="movimentos-page">
      <TopoPagina
        titulo="Movimentações de estoque"
        subtitulo="Registre entradas, saídas e ajustes e acompanhe o histórico."
        acao={
          <Botao
            variante="contorno"
            onClick={() => navegar('/estoque')}
          >
            Voltar ao estoque
          </Botao>
        }
      />

      {erro && (
        <div
          className="movimentos-alerta movimentos-alerta--erro"
          role="alert"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro('')}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}

      {sucesso && (
        <div
          className="movimentos-alerta movimentos-alerta--sucesso"
          role="status"
        >
          <span>{sucesso}</span>
          <button
            type="button"
            onClick={() => setSucesso('')}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}

      <div className="movimentos-conteudo">
        <section className="movimentos-card">
          <div className="movimentos-card__titulo">
            <span className="movimentos-card__icone">
              <ArrowLeftRight size={20} />
            </span>

            <div>
              <h2>Nova movimentação</h2>
              <p>Preencha os dados para atualizar o estoque.</p>
            </div>
          </div>

          <form className="movimentos-form" onSubmit={enviar}>
            <label>
              Produto *
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                required
              >
                <option value="">Selecione um produto</option>

                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} — estoque: {produto.quantidadeAtual}{' '}
                    {produto.unidade || ''}
                  </option>
                ))}
              </select>
            </label>

            {produtoSelecionado && (
              <div className="movimentos-saldo">
                <span>Estoque atual</span>
                <strong>
                  {produtoSelecionado.quantidadeAtual}{' '}
                  {produtoSelecionado.unidade || 'unidades'}
                </strong>
              </div>
            )}

            <fieldset className="movimentos-tipos">
              <legend>Tipo de movimentação *</legend>

              <label
                className={
                  tipo === 'ENTRADA' ? 'selecionado entrada' : ''
                }
              >
                <input
                  type="radio"
                  name="tipo"
                  value="ENTRADA"
                  checked={tipo === 'ENTRADA'}
                  onChange={() => setTipo('ENTRADA')}
                />
                <ArrowDownToLine size={18} />
                <span>Entrada</span>
              </label>

              <label
                className={tipo === 'SAIDA' ? 'selecionado saida' : ''}
              >
                <input
                  type="radio"
                  name="tipo"
                  value="SAIDA"
                  checked={tipo === 'SAIDA'}
                  onChange={() => setTipo('SAIDA')}
                />
                <ArrowUpFromLine size={18} />
                <span>Saída</span>
              </label>

              <label
                className={tipo === 'AJUSTE' ? 'selecionado ajuste' : ''}
              >
                <input
                  type="radio"
                  name="tipo"
                  value="AJUSTE"
                  checked={tipo === 'AJUSTE'}
                  onChange={() => setTipo('AJUSTE')}
                />
                <ArrowLeftRight size={18} />
                <span>Ajuste</span>
              </label>
            </fieldset>

            <label>
              {tipo === 'AJUSTE'
                ? 'Quantidade final após ajuste *'
                : 'Quantidade *'}

              <input
                type="number"
                min="0"
                step="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />

              {tipo === 'AJUSTE' && (
                <small>
                  Informe o saldo final desejado, não a diferença.
                </small>
              )}
            </label>

            <label>
              Motivo
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Descreva o motivo da movimentação (opcional)"
              />

              <small>{motivo.length}/500 caracteres</small>
            </label>

            <div className="movimentos-acoes">
              <Botao
                variante="contorno"
                onClick={() => navegar('/estoque')}
                disabled={salvando}
              >
                Cancelar
              </Botao>

              <Botao type="submit" disabled={salvando || carregando}>
                {salvando ? 'Registrando...' : 'Registrar movimentação'}
              </Botao>
            </div>
          </form>
        </section>

        <section className="movimentos-card movimentos-historico">
          <div className="movimentos-card__titulo">
            <span className="movimentos-card__icone">
              <History size={20} />
            </span>

            <div>
              <h2>Histórico de movimentações</h2>
              <p>Consulte as alterações realizadas no estoque.</p>
            </div>

            <Botao
              variante="contorno"
              icone={RefreshCw}
              onClick={carregar}
              disabled={carregando}
            >
              Atualizar
            </Botao>
          </div>

          <div className="movimentos-filtros">
            <label className="movimentos-busca">
              <Search size={18} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto ou motivo"
              />
            </label>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              aria-label="Filtrar por tipo"
            >
              <option value="TODOS">Todos os tipos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>

          <div className="movimentos-tabela-wrap">
            <table className="movimentos-tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Saldo anterior</th>
                  <th>Saldo novo</th>
                  <th>Motivo</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="7" className="movimentos-vazio">
                      Carregando histórico...
                    </td>
                  </tr>
                ) : historicoFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="movimentos-vazio">
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                ) : (
                  historicoFiltrado.map((movimentacao) => (
                    <tr key={movimentacao.id}>
                      <td>{dataHora(movimentacao.dataCriacao)}</td>
                      <td>
                        {movimentacao.produtoNome ||
                          `Produto #${movimentacao.produtoId}`}
                      </td>
                      <td>
                        <span
                          className={`movimentos-badge movimentos-badge--${String(
                            movimentacao.tipo
                          ).toLowerCase()}`}
                        >
                          {tipoLabel[movimentacao.tipo] ||
                            movimentacao.tipo}
                        </span>
                      </td>
                      <td>{movimentacao.quantidadeMovimentada}</td>
                      <td>{movimentacao.quantidadeAnterior}</td>
                      <td>
                        <strong>{movimentacao.quantidadeNova}</strong>
                      </td>
                      <td>{movimentacao.motivo || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}

export default MovimentacoesEstoquePage