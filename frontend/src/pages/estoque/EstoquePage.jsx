import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList, Eye, History, Package, Pencil, Plus, RefreshCw, Search, SlidersHorizontal, Trash2, ArrowLeftRight } from 'lucide-react'
import TopoPagina from '../../components/layout/TopoPagina'
import Botao from '../../components/ui/Botao'
import ModalConfirmacao from '../../components/ui/ModalConfirmacao'
import { excluirProdutoEstoque, listarMovimentacoesEstoque, listarProdutosEstoque, obterResumoEstoque, registrarMovimentacaoEstoque } from '../../api/estoqueApi'
import './EstoquePage.css'

const moeda = (valor) => Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHora = (valor) => valor ? new Date(valor).toLocaleString('pt-BR') : '—'
const rotuloStatus = { NORMAL: 'Normal', BAIXO: 'Estoque baixo', ZERADO: 'Zerado' }

function EstoquePage() {
  const navegar = useNavigate()
  const localizacao = useLocation()
  const [produtos, setProdutos] = useState([])
  const [resumo, setResumo] = useState({ totalProdutos: 0, estoqueNormal: 0, estoqueBaixo: 0, estoqueZerado: 0 })
  const [movimentacoes, setMovimentacoes] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [produtoExcluir, setProdutoExcluir] = useState(null)
  const [erroExclusao, setErroExclusao] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const [modalMovimento, setModalMovimento] = useState(false)
  const [produtoMovimento, setProdutoMovimento] = useState('')
  const [tipoMovimento, setTipoMovimento] = useState('ENTRADA')
  const [quantidade, setQuantidade] = useState('1')
  const [motivo, setMotivo] = useState('')
  const [salvandoMovimento, setSalvandoMovimento] = useState(false)
  const [erroMovimento, setErroMovimento] = useState('')
  const [sucesso, setSucesso] = useState(localizacao.state?.mensagem || '')
  const [aba, setAba] = useState('produtos')
  const [filtroHistorico, setFiltroHistorico] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const [lista, indicadores, historico] = await Promise.all([
        listarProdutosEstoque(), obterResumoEstoque(), listarMovimentacoesEstoque(),
      ])
      setProdutos(Array.isArray(lista) ? lista : [])
      setResumo(indicadores || { totalProdutos: 0, estoqueNormal: 0, estoqueBaixo: 0, estoqueZerado: 0 })
      setMovimentacoes(Array.isArray(historico) ? historico : [])
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os dados do estoque.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const produtosFiltrados = useMemo(() => produtos.filter((p) => {
    const texto = `${p.nome || ''} ${p.codigoSku || ''} ${p.categoriaNome || ''}`.toLowerCase()
    return texto.includes(busca.trim().toLowerCase()) && (filtroStatus === 'TODOS' || p.statusEstoque === filtroStatus)
  }), [produtos, busca, filtroStatus])

  const historicoFiltrado = useMemo(() => movimentacoes.filter((m) => {
    const texto = `${m.produtoNome || ''} ${m.tipo || ''} ${m.motivo || ''}`.toLowerCase()
    return texto.includes(filtroHistorico.trim().toLowerCase())
  }), [movimentacoes, filtroHistorico])

  async function confirmarExclusao() {
    setExcluindo(true); setErroExclusao('')
    try {
      await excluirProdutoEstoque(produtoExcluir.id)
      setProdutoExcluir(null)
      setSucesso('Produto excluído com sucesso.')
      await carregar()
    } catch (e) {
      setErroExclusao(e.message || 'Não foi possível excluir o produto.')
    } finally { setExcluindo(false) }
  }

  async function salvarMovimentacao(evento) {
    evento.preventDefault(); setErroMovimento(''); setSucesso('')
    const qtd = Number(quantidade)
    if (!produtoMovimento) { setErroMovimento('Selecione um produto.'); return }
    if (!Number.isInteger(qtd) || qtd < 0 || (tipoMovimento !== 'AJUSTE' && qtd <= 0)) {
      setErroMovimento(tipoMovimento === 'AJUSTE' ? 'Informe uma quantidade inteira igual ou maior que zero.' : 'Informe uma quantidade inteira maior que zero.')
      return
    }
    setSalvandoMovimento(true)
    try {
      await registrarMovimentacaoEstoque({ produtoId: Number(produtoMovimento), tipo: tipoMovimento, quantidade: qtd, motivo: motivo.trim() || null })
      setModalMovimento(false); setQuantidade('1'); setMotivo('')
      setSucesso('Movimentação registrada com sucesso.')
      await carregar()
    } catch (e) {
      setErroMovimento(e.message || 'Não foi possível registrar a movimentação.')
    } finally { setSalvandoMovimento(false) }
  }

  return <section className="estoque-page">
    <TopoPagina titulo="Estoque" subtitulo="Acompanhe produtos, níveis de estoque e movimentações." mostrarVoltar={false}
      acao={<Botao icone={Plus} onClick={() => navegar('/estoque/produtos/novo')}>Novo produto</Botao>} />

    {erro && <div className="estoque-alerta estoque-alerta--erro" role="alert">{erro}<button type="button" onClick={carregar}>Tentar novamente</button></div>}
    {sucesso && <div className="estoque-alerta estoque-alerta--sucesso" role="status">{sucesso}<button type="button" onClick={() => setSucesso('')} aria-label="Fechar aviso">×</button></div>}

    <div className="estoque-resumo">
      <article className="estoque-resumo__card"><span className="estoque-resumo__icone"><Package size={20}/></span><span className="estoque-resumo__rotulo">Total de produtos</span><strong>{resumo.totalProdutos ?? 0}</strong></article>
      <article className="estoque-resumo__card"><span className="estoque-resumo__icone estoque-resumo__icone--verde"><ClipboardList size={20}/></span><span className="estoque-resumo__rotulo">Estoque normal</span><strong>{resumo.estoqueNormal ?? 0}</strong></article>
      <article className="estoque-resumo__card"><span className="estoque-resumo__icone estoque-resumo__icone--amarelo"><SlidersHorizontal size={20}/></span><span className="estoque-resumo__rotulo">Estoque baixo</span><strong>{resumo.estoqueBaixo ?? 0}</strong></article>
      <article className="estoque-resumo__card"><span className="estoque-resumo__icone estoque-resumo__icone--vermelho"><Package size={20}/></span><span className="estoque-resumo__rotulo">Estoque zerado</span><strong>{resumo.estoqueZerado ?? 0}</strong></article>
    </div>

    <div className="estoque-abas" role="tablist" aria-label="Seções do estoque">
      <button type="button" role="tab" aria-selected={aba === 'produtos'} className={aba === 'produtos' ? 'ativo' : ''} onClick={() => setAba('produtos')}>Produtos</button>
      <button type="button" role="tab" aria-selected={aba === 'historico'} className={aba === 'historico' ? 'ativo' : ''} onClick={() => setAba('historico')}><History size={16}/> Histórico de movimentações</button>
    </div>

    {aba === 'produtos' ? <>
      <div className="estoque-toolbar">
        <label className="estoque-busca"><Search size={18}/><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, SKU ou categoria" /></label>
        <select aria-label="Filtrar por status" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}><option value="TODOS">Todos os status</option><option value="NORMAL">Normal</option><option value="BAIXO">Estoque baixo</option><option value="ZERADO">Zerado</option></select>
        <Botao variante="contorno" icone={RefreshCw} onClick={carregar} disabled={carregando}>Atualizar</Botao>
        <Botao variante="contorno" icone={ArrowLeftRight} onClick={() => navegar('/estoque/movimentacoes')}>Movimentações</Botao>
        <Botao icone={ArrowUpFromLine} onClick={() => { setTipoMovimento('ENTRADA'); setProdutoMovimento(''); setErroMovimento(''); setModalMovimento(true) }}>Movimentar estoque</Botao>
      </div>
      <div className="estoque-tabela-container"><table className="estoque-tabela"><thead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Qtd. atual</th><th>Qtd. mínima</th><th>Custo</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {carregando ? <tr><td colSpan="8" className="estoque-vazio">Carregando produtos...</td></tr> : produtosFiltrados.length === 0 ? <tr><td colSpan="8" className="estoque-vazio">{produtos.length ? 'Nenhum produto corresponde aos filtros.' : 'Nenhum produto cadastrado.'}</td></tr> : produtosFiltrados.map((p) => <tr key={p.id}><td className="estoque-produto-nome">{p.nome}<small>{p.ativo ? 'Ativo' : 'Inativo'}</small></td><td>{p.codigoSku || '—'}</td><td>{p.categoriaNome || '—'}</td><td><strong>{p.quantidadeAtual} {p.unidade}</strong></td><td>{p.quantidadeMinima} {p.unidade}</td><td>{moeda(p.precoCusto)}</td><td><span className={`estoque-status estoque-status--${String(p.statusEstoque || '').toLowerCase()}`}>{rotuloStatus[p.statusEstoque] || p.statusEstoque || '—'}</span></td><td><div className="estoque-acoes"><button type="button" title="Ver histórico do produto" onClick={() => { setFiltroHistorico(p.nome); setAba('historico') }}><History size={16}/></button><button type="button" title="Editar produto" onClick={() => navegar(`/estoque/produtos/${p.id}/editar`)}><Pencil size={16}/></button><button type="button" title="Excluir produto" onClick={() => { setProdutoExcluir(p); setErroExclusao('') }}><Trash2 size={16}/></button></div></td></tr>)}
      </tbody></table></div>
    </> : <>
      <div className="estoque-toolbar"><label className="estoque-busca"><Search size={18}/><input value={filtroHistorico} onChange={(e) => setFiltroHistorico(e.target.value)} placeholder="Buscar por produto, tipo ou motivo" /></label><Botao variante="contorno" icone={RefreshCw} onClick={carregar} disabled={carregando}>Atualizar histórico</Botao></div>
      <div className="estoque-tabela-container"><table className="estoque-tabela"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Saldo anterior</th><th>Saldo novo</th><th>Motivo</th></tr></thead><tbody>
        {carregando ? <tr><td colSpan="7" className="estoque-vazio">Carregando histórico...</td></tr> : historicoFiltrado.length === 0 ? <tr><td colSpan="7" className="estoque-vazio">Nenhuma movimentação encontrada.</td></tr> : historicoFiltrado.map((m) => <tr key={m.id}><td>{dataHora(m.dataCriacao)}</td><td>{m.produtoNome}</td><td><span className={`estoque-tipo estoque-tipo--${String(m.tipo).toLowerCase()}`}>{m.tipo}</span></td><td>{m.quantidadeMovimentada}</td><td>{m.quantidadeAnterior}</td><td><strong>{m.quantidadeNova}</strong></td><td>{m.motivo || '—'}</td></tr>)}
      </tbody></table></div>
    </>}

    {modalMovimento && (
      <div
        className="estoque-overlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !salvandoMovimento) {
            setModalMovimento(false)
          }
        }}
      >
        <section
          className="estoque-modal estoque-modal--movimentacao"
          role="dialog"
          aria-modal="true"
          aria-labelledby="estoque-modal-titulo"
        >
          <div className="estoque-modal__topo">
            <span className="estoque-modal__icone">
              <ArrowLeftRight size={20} />
            </span>

            <div className="estoque-modal__cabecalho">
              <h2 id="estoque-modal-titulo">Nova movimentação</h2>
              <p>Preencha os dados para atualizar o estoque.</p>
            </div>

            <button
              type="button"
              className="estoque-modal__fechar"
              onClick={() => setModalMovimento(false)}
              aria-label="Fechar"
              disabled={salvandoMovimento}
            >
              ×
            </button>
          </div>

          <form onSubmit={salvarMovimentacao} className="estoque-formulario">
            <label>
              Produto *
              <select
                value={produtoMovimento}
                onChange={(e) => setProdutoMovimento(e.target.value)}
                required
              >
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — estoque: {p.quantidadeAtual} {p.unidade || ''}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="estoque-modal__tipos">
              <legend>Tipo de movimentação *</legend>

              <div className="estoque-modal__tipos-opcoes">
                <label className={tipoMovimento === 'ENTRADA' ? 'selecionado entrada' : ''}>
                  <input
                    type="radio"
                    name="tipoMovimentoEstoque"
                    value="ENTRADA"
                    checked={tipoMovimento === 'ENTRADA'}
                    onChange={() => setTipoMovimento('ENTRADA')}
                  />
                  <ArrowDownToLine size={18} />
                  <span>Entrada</span>
                </label>

                <label className={tipoMovimento === 'SAIDA' ? 'selecionado saida' : ''}>
                  <input
                    type="radio"
                    name="tipoMovimentoEstoque"
                    value="SAIDA"
                    checked={tipoMovimento === 'SAIDA'}
                    onChange={() => setTipoMovimento('SAIDA')}
                  />
                  <ArrowUpFromLine size={18} />
                  <span>Saída</span>
                </label>

                <label className={tipoMovimento === 'AJUSTE' ? 'selecionado ajuste' : ''}>
                  <input
                    type="radio"
                    name="tipoMovimentoEstoque"
                    value="AJUSTE"
                    checked={tipoMovimento === 'AJUSTE'}
                    onChange={() => setTipoMovimento('AJUSTE')}
                  />
                  <ArrowLeftRight size={18} />
                  <span>Ajuste</span>
                </label>
              </div>
            </fieldset>

            <label>
              {tipoMovimento === 'AJUSTE'
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
              {tipoMovimento === 'AJUSTE' && (
                <small>Informe o saldo final desejado, não a diferença.</small>
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

            {erroMovimento && (
              <p className="estoque-alerta estoque-alerta--erro" role="alert">
                {erroMovimento}
              </p>
            )}

            <div className="estoque-modal__acoes">
              <Botao
                variante="contorno"
                onClick={() => setModalMovimento(false)}
                disabled={salvandoMovimento}
              >
                Cancelar
              </Botao>
              <Botao type="submit" disabled={salvandoMovimento}>
                {salvandoMovimento ? 'Registrando...' : 'Registrar movimentação'}
              </Botao>
            </div>
          </form>
        </section>
      </div>
    )}

    {produtoExcluir && <ModalConfirmacao aberto={Boolean(produtoExcluir)} titulo="Excluir produto" mensagem={`Deseja realmente excluir o produto “${produtoExcluir.nome}”? Se houver movimentações vinculadas, o sistema poderá impedir a exclusão.`} onConfirmar={confirmarExclusao} onCancelar={() => { setProdutoExcluir(null); setErroExclusao('') }} carregando={excluindo} erro={erroExclusao} />}
  </section>
}

export default EstoquePage