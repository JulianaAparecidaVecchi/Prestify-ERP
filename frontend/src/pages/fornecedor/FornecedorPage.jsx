import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Power,
} from 'lucide-react'

import {
  listarFornecedores,
  inativarFornecedor,
  reativarFornecedor,
} from '../../api/fornecedorApi'

import Botao from '../../components/ui/Botao'
import ModalConfirmacao from '../../components/ui/ModalConfirmacao'
import TopoPagina from '../../components/layout/TopoPagina'
import './FornecedorPage.css'

const ITENS_POR_PAGINA = 5

function nomeFornecedor(fornecedor) {
  return fornecedor.tipoPessoa === 'FISICA'
    ? fornecedor.nome || '—'
    : fornecedor.razaoSocial || '—'
}

function documentoFornecedor(fornecedor) {
  return fornecedor.tipoPessoa === 'FISICA'
    ? fornecedor.cpf || '—'
    : fornecedor.cnpj || '—'
}

function FornecedorPage() {
  const navegar = useNavigate()

  const [fornecedores, setFornecedores] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [pagina, setPagina] = useState(1)

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [fornecedorParaAlterar, setFornecedorParaAlterar] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erroStatus, setErroStatus] = useState('')

  const carregarFornecedores = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const dados = await listarFornecedores()
      setFornecedores(Array.isArray(dados) ? dados : [])
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar os fornecedores.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarFornecedores()
  }, [carregarFornecedores])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return fornecedores.filter((fornecedor) => {
      const correspondeBusca = [
        nomeFornecedor(fornecedor),
        documentoFornecedor(fornecedor),
        fornecedor.email,
        fornecedor.telefone,
        fornecedor.segmentoAtuacao,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(termo)

      const ativo = fornecedor.ativo !== false

      const correspondeStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && ativo) ||
        (filtroStatus === 'INATIVOS' && !ativo)

      return correspondeBusca && correspondeStatus
    })
  }, [fornecedores, busca, filtroStatus])

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITENS_POR_PAGINA)
  )

  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA

  const fornecedoresDaPagina = filtrados.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  )

  function alterarBusca(valor) {
    setBusca(valor)
    setPagina(1)
  }

  function alterarFiltro(valor) {
    setFiltroStatus(valor)
    setPagina(1)
  }

  function abrirConfirmacao(fornecedor) {
    setFornecedorParaAlterar(fornecedor)
    setErroStatus('')
  }

  function cancelarAlteracao() {
    if (alterandoStatus) return

    setFornecedorParaAlterar(null)
    setErroStatus('')
  }

  async function confirmarAlteracao() {
    if (!fornecedorParaAlterar) return

    const fornecedor = fornecedorParaAlterar
    const ativo = fornecedor.ativo !== false

    setAlterandoStatus(true)
    setErroStatus('')

    try {
      if (ativo) {
        await inativarFornecedor(fornecedor.id)
      } else {
        await reativarFornecedor(fornecedor.id)
      }

      setFornecedorParaAlterar(null)
      await carregarFornecedores()
    } catch (falha) {
      setErroStatus(
        falha.message || 'Não foi possível alterar o status do fornecedor.'
      )
    } finally {
      setAlterandoStatus(false)
    }
  }

  const fornecedorSelecionadoAtivo =
    fornecedorParaAlterar?.ativo !== false

  return (
    <section className="pagina-fornecedor">
      <TopoPagina
        titulo="Fornecedores"
        subtitulo="Visualize as informações sobre os fornecedores abaixo."
        acao={
          <Botao
            icone={Plus}
            onClick={() => navegar('/fornecedores/novo')}
          >
            Novo Fornecedor
          </Botao>
        }
      />

      <div className="pagina-fornecedor__filtros">
        <label className="pagina-fornecedor__busca">
          <Search size={18} />

          <input
            type="text"
            value={busca}
            onChange={(evento) => alterarBusca(evento.target.value)}
            placeholder="Buscar fornecedor..."
          />
        </label>

        <label className="pagina-fornecedor__filtro">
          <SlidersHorizontal size={18} />

          <select
            value={filtroStatus}
            onChange={(evento) => alterarFiltro(evento.target.value)}
            aria-label="Filtrar fornecedores por status"
          >
            <option value="TODOS">Todos</option>
            <option value="ATIVOS">Ativos</option>
            <option value="INATIVOS">Inativos</option>
          </select>
        </label>
      </div>

      <div className="pagina-fornecedor__tabela-container">
        <table className="pagina-fornecedor__tabela">
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Documento</th>
              <th>Contato</th>
              <th>Telefone</th>
              <th>Segmento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="7" className="pagina-fornecedor__aviso">
                  Carregando fornecedores...
                </td>
              </tr>
            ) : erro ? (
              <tr>
                <td colSpan="7" className="pagina-fornecedor__aviso">
                  <p className="pagina-fornecedor__mensagem-erro">
                    {erro}
                  </p>

                  <Botao variante="contorno" onClick={carregarFornecedores}>
                    Tentar novamente
                  </Botao>
                </td>
              </tr>
            ) : fornecedoresDaPagina.length === 0 ? (
              <tr>
                <td colSpan="7" className="pagina-fornecedor__aviso">
                  {fornecedores.length === 0
                    ? 'Nenhum fornecedor cadastrado ainda.'
                    : 'Nenhum fornecedor encontrado para essa busca.'}
                </td>
              </tr>
            ) : (
              fornecedoresDaPagina.map((fornecedor) => {
                const ativo = fornecedor.ativo !== false

                return (
                  <tr key={fornecedor.id}>
                    <td>{nomeFornecedor(fornecedor)}</td>
                    <td>{documentoFornecedor(fornecedor)}</td>
                    <td>{fornecedor.email || '—'}</td>
                    <td>{fornecedor.telefone || '—'}</td>
                    <td>{fornecedor.segmentoAtuacao || '—'}</td>

                    <td>
                      <span
                        className={
                          `pagina-fornecedor__status ${
                            ativo
                              ? 'pagina-fornecedor__status--ativo'
                              : 'pagina-fornecedor__status--inativo'
                          }`
                        }
                      >
                        {ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <div className="pagina-fornecedor__acoes">
                        <button
                          type="button"
                          className="pagina-fornecedor__acao pagina-fornecedor__acao--visualizar"
                          title="Visualizar"
                          aria-label={`Visualizar ${nomeFornecedor(fornecedor)}`}
                          onClick={() =>
                            navegar(`/fornecedores/${fornecedor.id}`)
                          }
                        >
                          <Eye size={15} />
                        </button>

                        {ativo && (
                          <button
                            type="button"
                            className="pagina-fornecedor__acao pagina-fornecedor__acao--editar"
                            title="Editar"
                            aria-label={`Editar ${nomeFornecedor(fornecedor)}`}
                            onClick={() =>
                              navegar(`/fornecedores/${fornecedor.id}/editar`)
                            }
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          className={`pagina-fornecedor__acao pagina-fornecedor__acao--status ${
                            ativo
                              ? 'pagina-fornecedor__acao--inativar'
                              : 'pagina-fornecedor__acao--reativar'
                          }`}
                          title={ativo ? 'Inativar' : 'Reativar'}
                          aria-label={`${ativo ? 'Inativar' : 'Reativar'} ${nomeFornecedor(fornecedor)}`}
                          disabled={
                            alterandoStatus &&
                            fornecedorParaAlterar?.id === fornecedor.id
                          }
                          onClick={() => abrirConfirmacao(fornecedor)}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <div className="pagina-fornecedor__rodape-tabela">
          <span>
            {filtrados.length === 0
              ? 'Mostrando 0 fornecedores'
              : `Mostrando ${inicio + 1} a ${
                  inicio + fornecedoresDaPagina.length
                } de ${filtrados.length} fornecedores`}
          </span>

          <div className="pagina-fornecedor__paginacao">
            <button
              type="button"
              className="pagina-fornecedor__pagina"
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
                className={
                  `pagina-fornecedor__pagina ${
                    paginaAtual === indice + 1
                      ? 'pagina-fornecedor__pagina--ativa'
                      : ''
                  }`
                }
                onClick={() => setPagina(indice + 1)}
              >
                {indice + 1}
              </button>
            ))}

            <button
              type="button"
              className="pagina-fornecedor__pagina"
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
        aberto={Boolean(fornecedorParaAlterar)}
        titulo={fornecedorSelecionadoAtivo
          ? 'Inativar fornecedor'
          : 'Reativar fornecedor'}
        mensagem={
          fornecedorParaAlterar
            ? `Deseja realmente ${
                fornecedorSelecionadoAtivo ? 'inativar' : 'reativar'
              } o fornecedor "${nomeFornecedor(fornecedorParaAlterar)}"?`
            : ''
        }
        textoConfirmar={fornecedorSelecionadoAtivo ? 'Inativar' : 'Reativar'}
        carregando={alterandoStatus}
        erro={erroStatus}
        onConfirmar={confirmarAlteracao}
        onCancelar={cancelarAlteracao}
      />
    </section>
  )
}

export default FornecedorPage