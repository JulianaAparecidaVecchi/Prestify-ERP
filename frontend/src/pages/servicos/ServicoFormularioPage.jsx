import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Info, Plus, Trash2 } from 'lucide-react'
import { buscarServico, criarServico, atualizarServico } from '../../api/servicoApi'
import { listarCategorias } from '../../api/categoriaApi'
import Botao from '../../components/ui/Botao'
import './ServicoFormularioPage.css'

const variacaoVazia = () => ({ nome: '', descricao: '', preco: '' })
const moedaParaNumero = (valor) => {
  const texto = String(valor ?? '').trim().replace(/\s/g, '')
  if (!texto) return Number.NaN
  const normalizado = texto.includes(',')
    ? texto.replace(/\./g, '').replace(',', '.')
    : texto
  return Number(normalizado)
}

function ServicoFormularioPage({ modo = 'criar' }) {
  const { id } = useParams()
  const navegar = useNavigate()
  const leitura = modo === 'visualizar'
  const [categorias, setCategorias] = useState([])
  const [dados, setDados] = useState({ codigo: '', nome: '', descricao: '', duracaoEstimada: '', categoriaId: '', tipoPreco: 'UNICO', preco: '', variacoes: [] })
  const [variacaoAtual, setVariacaoAtual] = useState(variacaoVazia())
  const [carregando, setCarregando] = useState(modo !== 'criar')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    Promise.all([listarCategorias(), modo === 'criar' ? Promise.resolve(null) : buscarServico(id)])
      .then(([cats, servico]) => {
        if (!ativo) return
        setCategorias(cats.filter((categoria) => categoria.tipo === 'SERVICO').map((categoria) => ({ valor: String(categoria.id), rotulo: categoria.nome })))
        if (servico) setDados({
          codigo: servico.codigo || '', nome: servico.nome || '', descricao: servico.descricao || '',
          duracaoEstimada: String(servico.duracaoEstimada ?? ''), categoriaId: String(servico.categoriaId ?? ''),
          tipoPreco: servico.tipoPreco || 'UNICO', preco: servico.preco == null ? '' : String(servico.preco),
          variacoes: servico.variacoes?.map((variacao) => ({ nome: variacao.nome, descricao: variacao.descricao || '', preco: String(variacao.preco) })) || []
        })
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
    return () => { ativo = false }
  }, [id, modo])

  function campo(evento) { setDados((anterior) => ({ ...anterior, [evento.target.name]: evento.target.value })) }

  function alterarTipoPreco(evento) {
    const tipoPreco = evento.target.value
    setDados((anterior) => ({ ...anterior, tipoPreco, preco: tipoPreco === 'UNICO' ? anterior.preco : '', variacoes: tipoPreco === 'UNICO' ? [] : anterior.variacoes }))
    setVariacaoAtual(variacaoVazia())
  }

  function adicionarVariacao() {
    const nome = variacaoAtual.nome.trim()
    const preco = moedaParaNumero(variacaoAtual.preco)
    if (!nome || !variacaoAtual.preco.trim() || !Number.isFinite(preco) || preco <= 0) {
      setErro('Informe o nome e um preço maior que zero para a variação.')
      return
    }
    if (dados.variacoes.some((variacao) => variacao.nome.trim().toLocaleLowerCase() === nome.toLocaleLowerCase())) {
      setErro('Já existe uma variação com esse nome.')
      return
    }
    setDados((anterior) => ({ ...anterior, variacoes: [...anterior.variacoes, { ...variacaoAtual, nome, preco: String(preco.toFixed(2)) }] }))
    setVariacaoAtual(variacaoVazia())
    setErro('')
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    if (dados.tipoPreco === 'UNICO' && (!Number.isFinite(moedaParaNumero(dados.preco)) || moedaParaNumero(dados.preco) <= 0)) {
      setErro('Informe um preço maior que zero para o serviço.')
      return
    }
    if (dados.tipoPreco === 'VARIACOES' && dados.variacoes.length === 0) {
      setErro('Adicione pelo menos uma variação com seu preço.')
      return
    }
    const payload = {
      ...dados,
      codigo: dados.codigo.trim() || null,
      duracaoEstimada: Number(dados.duracaoEstimada),
      categoriaId: Number(dados.categoriaId),
      preco: dados.tipoPreco === 'UNICO' ? moedaParaNumero(dados.preco) : null,
      variacoes: dados.tipoPreco === 'VARIACOES' ? dados.variacoes.map((variacao) => ({ ...variacao, preco: Number(variacao.preco) })) : []
    }
    setSalvando(true)
    try {
      if (modo === 'editar') await atualizarServico(id, payload)
      else await criarServico(payload)
      navegar('/servicos')
    } catch (e) { setErro(e.message); setSalvando(false) }
  }

  const titulo = modo === 'criar' ? 'Cadastro de Serviço' : modo === 'editar' ? 'Edição de Serviço' : 'Detalhes do Serviço'

  return <section className="formulario-servico">
    <button type="button" className="formulario-servico__voltar" onClick={() => navegar('/servicos')}><ArrowLeft size={18} /> Voltar</button>
    <header className="formulario-servico__cabecalho"><h1>{titulo}</h1><p>Preencha as informações do serviço abaixo</p></header>
    {carregando ? <p>Carregando...</p> : <form onSubmit={enviar}>
      {erro && <p className="formulario-servico__erro" role="alert">{erro}</p>}
      <section className="formulario-servico__cartao">
        <h2><span className="formulario-servico__icone"><FileText size={17} /></span>Informações básicas</h2>
        <div className="formulario-servico__grade-basica">
          <label className="formulario-servico__campo"><span>Nome do serviço <b>*</b></span><input name="nome" value={dados.nome} onChange={campo} disabled={leitura} required placeholder="Digite o nome do serviço" /></label>
          <label className="formulario-servico__campo"><span>Categoria <b>*</b></span><select name="categoriaId" value={dados.categoriaId} onChange={campo} disabled={leitura} required><option value="">Selecione uma categoria</option>{categorias.map((categoria) => <option key={categoria.valor} value={categoria.valor}>{categoria.rotulo}</option>)}</select></label>
          <label className="formulario-servico__campo"><span>Código do serviço <small>(opcional)</small></span><input name="codigo" value={dados.codigo} onChange={campo} disabled={leitura} placeholder="Digite o código do serviço" /></label>
          <label className="formulario-servico__campo formulario-servico__campo--largo"><span>Descrição <small>(opcional)</small></span><textarea name="descricao" value={dados.descricao} onChange={campo} disabled={leitura} placeholder="Descreva o serviço, o que está incluso, diferenciais, observações importantes" rows="3" /></label>
        </div>
      </section>

      <section className="formulario-servico__cartao formulario-servico__cartao--detalhes">
        <h2><span className="formulario-servico__icone"><Info size={17} /></span>Detalhes adicionais</h2>
        <div className="formulario-servico__grade-detalhes">
          <label className="formulario-servico__campo"><span>Duração estimada <b>*</b></span><input type="number" min="1" name="duracaoEstimada" value={dados.duracaoEstimada} onChange={campo} disabled={leitura} required placeholder="Digite a duração estimada" /><small>Tempo estimado para realização</small></label>
          <fieldset className="formulario-servico__tipo-preco"><legend>Tipo de preço <b>*</b></legend><label><input type="radio" name="tipoPreco" value="UNICO" checked={dados.tipoPreco === 'UNICO'} onChange={alterarTipoPreco} disabled={leitura} /> Preço único</label><label><input type="radio" name="tipoPreco" value="VARIACOES" checked={dados.tipoPreco === 'VARIACOES'} onChange={alterarTipoPreco} disabled={leitura} /> Preço por variação</label></fieldset>
          {dados.tipoPreco === 'UNICO' ? <label className="formulario-servico__campo"><span>Preço <b>*</b></span><div className="formulario-servico__preco"><span>R$</span><input name="preco" inputMode="decimal" value={dados.preco} onChange={campo} disabled={leitura} required placeholder="0,00" /></div><small>Defina o preço a ser cobrado</small></label> : <div className="formulario-servico__campo formulario-servico__campo--preco-variacao"><span>Preço por variação <b>*</b></span><p>Informe um preço para cada variação adicionada abaixo.</p></div>}
        </div>
        {dados.tipoPreco === 'VARIACOES' && <div className="formulario-servico__adicionar-variacao">
          <label className="formulario-servico__campo"><span>Nome da variação <b>*</b></span><input value={variacaoAtual.nome} onChange={(e) => setVariacaoAtual((anterior) => ({ ...anterior, nome: e.target.value }))} disabled={leitura} placeholder="Digite o nome da variação" /></label>
          <label className="formulario-servico__campo"><span>Preço (R$) <b>*</b></span><div className="formulario-servico__preco"><span>R$</span><input inputMode="decimal" value={variacaoAtual.preco} onChange={(e) => setVariacaoAtual((anterior) => ({ ...anterior, preco: e.target.value }))} disabled={leitura} placeholder="0,00" /></div></label>
          {!leitura && <button type="button" className="formulario-servico__adicionar-botao" onClick={adicionarVariacao}><Plus size={16} /> Adicionar variação</button>}
        </div>}
      </section>

      <section className="formulario-servico__lista-variacoes"><h3>Variações do Serviço</h3>{dados.tipoPreco !== 'VARIACOES' || dados.variacoes.length === 0 ? <p>Não há variações do serviço</p> : <div className="formulario-servico__tabela-variacoes">{dados.variacoes.map((variacao, indice) => <div className="formulario-servico__linha-variacao" key={`${variacao.nome}-${indice}`}><div><strong>{variacao.nome}</strong>{variacao.descricao && <small>{variacao.descricao}</small>}</div><strong>{Number(variacao.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>{!leitura && <button type="button" aria-label={`Remover ${variacao.nome}`} onClick={() => setDados((anterior) => ({ ...anterior, variacoes: anterior.variacoes.filter((_, i) => i !== indice) }))}><Trash2 size={16} /></button>}</div>)}</div>}</section>
      <div className="formulario-servico__acoes">{!leitura ? <button className="formulario-servico__submit" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : modo === 'editar' ? 'Salvar alterações' : 'Cadastrar'}</button> : <button className="formulario-servico__submit" type="button" onClick={() => navegar(`/servicos/${id}/editar`)}>Editar serviço</button>}</div>
    </form>}
  </section>
}

export default ServicoFormularioPage
