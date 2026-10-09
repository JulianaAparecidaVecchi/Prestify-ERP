import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { excluirCategoria, listarCategorias } from '../../api/categoriaApi'
import Botao from '../../components/ui/Botao'
import ModalConfirmacao from '../../components/ui/ModalConfirmacao'
import TopoPagina from '../../components/layout/TopoPagina'
import './CategoriaPage.css'

const ITENS_POR_PAGINA = 5

const nomesTipo = {
  SERVICO: 'Serviço',
  PRODUTO: 'Produto',
}

function CategoriaPage() {
  const navegar = useNavigate()

  // Dados vindos do backend
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Busca, filtro e paginação (feitos aqui no navegador)
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('TODOS')
  const [pagina, setPagina] = useState(1)

  // Exclusão: guarda a categoria que está esperando confirmação
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState('')

  const carregarCategorias = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const dados = await listarCategorias()
      setCategorias(Array.isArray(dados) ? dados : [])
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarCategorias()
  }, [carregarCategorias])

  // Aplica busca e filtro de tipo sobre a lista completa
  const categoriasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return categorias.filter((categoria) => {
      const combinaNome = (categoria.nome || '').toLowerCase().includes(termo)
      const combinaTipo =
        tipoFiltro === 'TODOS' || categoria.tipo === tipoFiltro

      return combinaNome && combinaTipo
    })
  }, [categorias, busca, tipoFiltro])

  const total = categoriasFiltradas.length
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA))

  // Se a página atual deixou de existir (ex.: excluiu o último item dela)
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  const categoriasDaPagina = categoriasFiltradas.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  )

  function alterarBusca(valor) {
    setBusca(valor)
    setPagina(1)
  }

  function alterarFiltro(valor) {
    setTipoFiltro(valor)
    setPagina(1)
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    setErroExclusao('')

    try {
      await excluirCategoria(categoriaParaExcluir.id)
      setCategoriaParaExcluir(null)
      await carregarCategorias()
    } catch (falha) {
      setErroExclusao(falha.message)
    } finally {
      setExcluindo(false)
    }
  }

  function cancelarExclusao() {
    setCategoriaParaExcluir(null)
    setErroExclusao('')
  }

  // O que aparece dentro da tabela, conforme o estado da tela
  function renderizarCorpoTabela() {
    if (carregando) {
      return (
        <tr>
          <td colSpan="3" className="pagina-categoria__aviso">
            Carregando categorias...
          </td>
        </tr>
      )
    }

    if (erro) {
      return (
        <tr>
          <td colSpan="3" className="pagina-categoria__aviso">
            <p className="pagina-categoria__mensagem-erro">{erro}</p>
            <Botao variante="contorno" onClick={carregarCategorias}>
              Tentar novamente
            </Botao>
          </td>
        </tr>
      )
    }

    if (categoriasDaPagina.length === 0) {
      return (
        <tr>
          <td colSpan="3" className="pagina-categoria__aviso">
            {categorias.length === 0
              ? 'Nenhuma categoria cadastrada ainda.'
              : 'Nenhuma categoria encontrada para essa busca.'}
          </td>
        </tr>
      )
    }

    return categoriasDaPagina.map((categoria) => (
      <tr key={categoria.id}>
        <td>{categoria.nome}</td>
        <td>{nomesTipo[categoria.tipo] || categoria.tipo}</td>
        <td>
          <div className="pagina-categoria__acoes">
            <button
              type="button"
              className="pagina-categoria__acao pagina-categoria__acao--editar"
              aria-label={`Editar ${categoria.nome}`}
              onClick={() => navegar(`/categorias/${categoria.id}/editar`)}
            >
              <Pencil size={14} />
            </button>

            <button
              type="button"
              className="pagina-categoria__acao pagina-categoria__acao--excluir"
              aria-label={`Excluir ${categoria.nome}`}
              onClick={() => setCategoriaParaExcluir(categoria)}
            >
              <Trash2 size={14} />
            </button>

            <button
              type="button"
              className="pagina-categoria__acao pagina-categoria__acao--visualizar"
              aria-label={`Visualizar ${categoria.nome}`}
              onClick={() => navegar(`/categorias/${categoria.id}`)}
            >
              <Eye size={14} />
            </button>
          </div>
        </td>
      </tr>
    ))
  }

  return (
    <section className="pagina-categoria">
      <TopoPagina
        titulo="Categorias"
        subtitulo="Visualize as informações das suas categorias abaixo"
        acao={
          <Botao icone={Plus} onClick={() => navegar('/categorias/nova')}>
            Nova Categoria
          </Botao>
        }
      />

      <div className="pagina-categoria__filtros">
        <div className="pagina-categoria__busca">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar categoria..."
            value={busca}
            onChange={(evento) => alterarBusca(evento.target.value)}
          />
        </div>

        <div className="pagina-categoria__filtro">
          <Filter size={18} />

          <select
            value={tipoFiltro}
            onChange={(evento) => alterarFiltro(evento.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="TODOS">Todos os tipos</option>
            <option value="SERVICO">Serviços</option>
            <option value="PRODUTO">Produtos</option>
          </select>
        </div>
      </div>

      <div className="pagina-categoria__tabela-container">
        <table className="pagina-categoria__tabela">
          <thead>
            <tr>
              <th>Nome da categoria</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>{renderizarCorpoTabela()}</tbody>
        </table>

        <div className="pagina-categoria__rodape-tabela">
          <span>
            {total === 0
              ? 'Mostrando 0 itens'
              : `Mostrando ${inicio + 1} a ${
                  inicio + categoriasDaPagina.length
                } de ${total} itens`}
          </span>

          <div className="pagina-categoria__paginacao">
            <button
              type="button"
              className="pagina-categoria__pagina"
              onClick={() => setPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPaginas }, (_, indice) => (
              <button
                key={indice + 1}
                type="button"
                className={`pagina-categoria__pagina ${
                  paginaAtual === indice + 1
                    ? 'pagina-categoria__pagina--ativa'
                    : ''
                }`}
                onClick={() => setPagina(indice + 1)}
              >
                {indice + 1}
              </button>
            ))}

            <button
              type="button"
              className="pagina-categoria__pagina"
              onClick={() => setPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ModalConfirmacao
        aberto={Boolean(categoriaParaExcluir)}
        titulo="Excluir categoria"
        mensagem={`Tem certeza que deseja excluir a categoria "${
          categoriaParaExcluir?.nome ?? ''
        }"? Essa ação não pode ser desfeita.`}
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
      />
    </section>
  )
}

export default CategoriaPage
